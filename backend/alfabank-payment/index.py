'''
Интеграция с Альфа-Банком для приема платежей
Принимает: POST create_payment (создание платежа), POST check_payment (проверка статуса)
Возвращает: URL для оплаты или статус платежа
'''

import json
import os
import requests
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn)

def handler(event: dict, context) -> dict:
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    body_data = json.loads(event.get('body', '{}'))
    action = body_data.get('action', '')
    
    api_key = os.environ.get('ALFABANK_API_KEY')
    if not api_key:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Альфа-Банк API ключ не настроен'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if action == 'create_payment':
            amount = body_data.get('amount', 0)
            user_id = body_data.get('user_id', 0)
            username = body_data.get('username', '')
            
            if not amount or amount < 1:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Минимальная сумма пополнения 1₽'}),
                    'isBase64Encoded': False
                }
            
            # Создаем заказ в Альфа-Банке
            alfabank_url = 'https://web.rbsuat.com/ab/rest/register.do'
            
            order_number = f'DONATE_{user_id}_{int(datetime.now().timestamp())}'
            
            payload = {
                'userName': api_key,
                'password': api_key,
                'orderNumber': order_number,
                'amount': int(amount * 100),  # В копейках
                'returnUrl': f'https://your-site.com/payment/success?order={order_number}',
                'failUrl': 'https://your-site.com/payment/fail',
                'description': f'Пополнение баланса игрока {username}'
            }
            
            response = requests.post(alfabank_url, json=payload, timeout=10)
            result = response.json()
            
            if result.get('errorCode'):
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': result.get('errorMessage', 'Ошибка создания платежа')}),
                    'isBase64Encoded': False
                }
            
            # Сохраняем платеж в БД
            cursor.execute('''
                INSERT INTO payments (order_id, user_id, username, amount, status, payment_url, created_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            ''', (
                result.get('orderId'),
                user_id,
                username,
                amount,
                'pending',
                result.get('formUrl'),
                datetime.now()
            ))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'success': True,
                    'payment_url': result.get('formUrl'),
                    'order_id': result.get('orderId')
                }),
                'isBase64Encoded': False
            }
        
        elif action == 'check_payment':
            order_id = body_data.get('order_id', '')
            
            if not order_id:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Order ID required'}),
                    'isBase64Encoded': False
                }
            
            # Проверяем статус в Альфа-Банке
            alfabank_url = 'https://web.rbsuat.com/ab/rest/getOrderStatusExtended.do'
            
            payload = {
                'userName': api_key,
                'password': api_key,
                'orderId': order_id
            }
            
            response = requests.post(alfabank_url, json=payload, timeout=10)
            result = response.json()
            
            order_status = result.get('orderStatus')
            
            if order_status == 2:  # Оплачен
                # Обновляем статус в БД
                cursor.execute('''
                    UPDATE payments 
                    SET status = %s, paid_at = %s
                    WHERE order_id = %s AND status = %s
                    RETURNING user_id, username, amount
                ''', ('paid', datetime.now(), order_id, 'pending'))
                
                payment = cursor.fetchone()
                
                if payment:
                    # Начисляем донат игроку (здесь нужна интеграция с вашей БД игроков)
                    # Пример: обновить u_donate в таблице users
                    pass
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'success': True,
                        'status': 'paid',
                        'message': 'Платеж успешно завершен'
                    }),
                    'isBase64Encoded': False
                }
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'success': True,
                    'status': 'pending',
                    'message': 'Ожидание оплаты'
                }),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Unknown action'}),
                'isBase64Encoded': False
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    
    finally:
        cursor.close()
        conn.close()
