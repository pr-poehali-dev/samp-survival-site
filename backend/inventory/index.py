'''
API для управления инвентарем игрока
GET - получить инвентарь игрока
POST - продать предмет из инвентаря
'''

import json
import os
from typing import Dict, Any
import pymysql

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
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
            query_params = event.get('queryStringParameters', {}) or {}
            user_id = query_params.get('user_id')
            
            if not user_id:
                cursor.close()
                connection.close()
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'user_id required'}),
                    'isBase64Encoded': False
                }
            
            # Получаем инвентарь
            inventory_columns = [f'u_i_slot_{i}' for i in range(1, 51)]
            cursor.execute(f"SELECT {', '.join(inventory_columns)} FROM users_inventory WHERE u_i_owner = %s", (user_id,))
            inventory = cursor.fetchone()
            
            if not inventory:
                cursor.close()
                connection.close()
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'items': []}),
                    'isBase64Encoded': False
                }
            
            # Получаем информацию о предметах
            cursor.execute('SELECT loot_id, loot_name, loot_price FROM server_loots')
            loots = {str(loot['loot_id']): loot for loot in cursor.fetchall()}
            
            # Формируем список предметов
            items = []
            for i in range(1, 51):
                col_name = f'u_i_slot_{i}'
                slot_value = inventory.get(col_name)
                
                if slot_value and slot_value not in ['0,0,0', '', 'None', 'null']:
                    parts = str(slot_value).split(',')
                    if len(parts) >= 1 and parts[0] != '0':
                        loot_id = parts[0]
                        # Флаг из_кейса: 1 = можно продавать, 0 или отсутствует = из игры
                        from_case = parts[3] if len(parts) > 3 else '0'
                        loot_info = loots.get(loot_id, {'loot_name': 'Неизвестный предмет', 'loot_price': 0})
                        items.append({
                            'slot': i,
                            'loot_id': loot_id,
                            'name': loot_info['loot_name'],
                            'price': int(loot_info['loot_price']),
                            'from_case': from_case == '1',
                            'can_sell': from_case == '1'
                        })
            
            cursor.close()
            connection.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'items': items}),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            user_id = body.get('user_id')
            slot = body.get('slot')
            
            if not user_id or not slot:
                cursor.close()
                connection.close()
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'user_id and slot required'}),
                    'isBase64Encoded': False
                }
            
            # Получаем предмет из слота
            cursor.execute(f"SELECT u_i_slot_{slot} FROM users_inventory WHERE u_i_owner = %s", (user_id,))
            result = cursor.fetchone()
            
            if not result:
                cursor.close()
                connection.close()
                return {
                    'statusCode': 404,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Inventory not found'}),
                    'isBase64Encoded': False
                }
            
            # КРИТИЧНО: Проверяем онлайн статус игрока перед продажей
            is_online = False
            
            try:
                # Метод 1: Проверка поля u_online
                cursor.execute("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'u_online'")
                has_online_field = cursor.fetchone() is not None
                
                if has_online_field:
                    cursor.execute('SELECT u_online FROM users WHERE u_id = %s', (user_id,))
                    user_data = cursor.fetchone()
                    if user_data and user_data.get('u_online', 0) == 1:
                        is_online = True
                
                # Метод 2: Проверка через last_action
                cursor.execute("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'u_last_action'")
                has_last_action = cursor.fetchone() is not None
                
                if has_last_action and not is_online:
                    import time
                    cursor.execute('SELECT u_last_action FROM users WHERE u_id = %s', (user_id,))
                    action_data = cursor.fetchone()
                    if action_data:
                        last_action = action_data.get('u_last_action', 0)
                        current_time = int(time.time())
                        # Активность менее 10 минут назад = онлайн
                        if current_time - last_action < 600:
                            is_online = True
                            
            except Exception as e:
                print(f"Online check error: {e}")
            
            if is_online:
                cursor.close()
                connection.close()
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': '🎮 Вы находитесь в игре! Выйдите из игры, чтобы продать предмет.'}),
                    'isBase64Encoded': False
                }
            
            slot_value = result.get(f'u_i_slot_{slot}')
            if not slot_value or slot_value in ['0,0,0', '', 'None', 'null']:
                cursor.close()
                connection.close()
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Slot is empty'}),
                    'isBase64Encoded': False
                }
            
            # Получаем информацию о предмете
            parts = str(slot_value).split(',')
            loot_id = parts[0]
            
            # Проверяем, что предмет из кейса (флаг = 1)
            from_case = parts[3] if len(parts) > 3 else '0'
            if from_case != '1':
                cursor.close()
                connection.close()
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Можно продавать только предметы, полученные из кейсов!'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute('SELECT loot_name, loot_price FROM server_loots WHERE loot_id = %s', (loot_id,))
            loot = cursor.fetchone()
            
            if not loot:
                cursor.close()
                connection.close()
                return {
                    'statusCode': 404,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Item not found'}),
                    'isBase64Encoded': False
                }
            
            # Цена продажи - 70% от стоимости
            sell_price = int(int(loot['loot_price']) * 0.7)
            
            # Очищаем слот (устанавливаем 0,0,0,0)
            cursor.execute(f"UPDATE users_inventory SET u_i_slot_{slot} = '0,0,0,0' WHERE u_i_owner = %s", (user_id,))
            
            # Начисляем деньги
            cursor.execute('UPDATE users SET u_money = u_money + %s WHERE u_id = %s', (sell_price, user_id))
            
            connection.commit()
            cursor.close()
            connection.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'success': True,
                    'item_name': loot['loot_name'],
                    'sell_price': sell_price
                }),
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
        try:
            cursor.close()
            connection.close()
        except:
            pass
        
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }