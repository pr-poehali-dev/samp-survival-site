'''
API для управления кейсами и их содержимым (админка)
GET - получить все кейсы и их настройки
POST - обновить настройки кейса (цены)
PUT - обновить настройки предмета (цену продажи, редкость)
'''

import json
from typing import Dict, Any
import pymysql

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    mysql_url = 'mysql://gs303055:cheburashka@80.242.59.112:3306/gs303055'
    
    parts = mysql_url.replace('mysql://', '').split('@')
    user_pass = parts[0].split(':')
    host_db = parts[1].split('/')
    host_port = host_db[0].split(':')
    
    try:
        connection = pymysql.connect(
            host=host_port[0],
            port=int(host_port[1]) if len(host_port) > 1 else 3306,
            user=user_pass[0],
            password=user_pass[1],
            database=host_db[1],
            cursorclass=pymysql.cursors.DictCursor,
            connect_timeout=5
        )
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': f'Database connection failed: {str(e)}'}),
            'isBase64Encoded': False
        }
    
    cursor = connection.cursor()
    
    try:
        if method == 'GET':
            # Получаем конфигурацию кейсов
            cursor.execute('SELECT * FROM cases_config ORDER BY case_id')
            cases = cursor.fetchall()
            
            # Получаем все предметы с настройками редкости
            cursor.execute('SELECT * FROM server_loots ORDER BY loot_id LIMIT 200')
            items = cursor.fetchall()
            
            cursor.close()
            connection.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'cases': cases or [], 'items': items or []}, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            # Обновление настроек кейса
            body = json.loads(event.get('body', '{}'))
            user_id = body.get('user_id')
            case_id = body.get('case_id')
            price_money = body.get('price_money')
            price_donate = body.get('price_donate')
            
            if not user_id:
                cursor.close()
                connection.close()
                return {
                    'statusCode': 401,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'user_id required'}),
                    'isBase64Encoded': False
                }
            
            # Проверка прав администратора
            cursor.execute('SELECT u_level FROM users WHERE u_id = %s', (user_id,))
            user = cursor.fetchone()
            
            if not user or user['u_level'] < 10:
                cursor.close()
                connection.close()
                return {
                    'statusCode': 403,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Admin access required'}),
                    'isBase64Encoded': False
                }
            
            # Обновляем цены кейса
            cursor.execute(
                'UPDATE cases_config SET price_money=%s, price_donate=%s WHERE case_id=%s',
                (price_money, price_donate, case_id)
            )
            
            connection.commit()
            cursor.close()
            connection.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            # Обновление настроек предмета
            body = json.loads(event.get('body', '{}'))
            user_id = body.get('user_id')
            loot_id = body.get('loot_id')
            loot_price = body.get('loot_price')
            drop_chance = body.get('drop_chance')
            
            if not user_id:
                cursor.close()
                connection.close()
                return {
                    'statusCode': 401,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'user_id required'}),
                    'isBase64Encoded': False
                }
            
            # Проверка прав администратора
            cursor.execute('SELECT u_level FROM users WHERE u_id = %s', (user_id,))
            user = cursor.fetchone()
            
            if not user or user['u_level'] < 10:
                cursor.close()
                connection.close()
                return {
                    'statusCode': 403,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Admin access required'}),
                    'isBase64Encoded': False
                }
            
            # Обновляем настройки предмета
            update_fields = []
            update_values = []
            
            if loot_price is not None:
                update_fields.append('loot_price=%s')
                update_values.append(loot_price)
            
            if drop_chance is not None:
                update_fields.append('drop_chance=%s')
                update_values.append(drop_chance)
            
            if update_fields:
                update_values.append(loot_id)
                cursor.execute(
                    f'UPDATE server_loots SET {", ".join(update_fields)} WHERE loot_id=%s',
                    tuple(update_values)
                )
            
            connection.commit()
            cursor.close()
            connection.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
        
        else:
            cursor.close()
            connection.close()
            return {
                'statusCode': 405,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
    
    except Exception as e:
        cursor.close()
        connection.close()
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
