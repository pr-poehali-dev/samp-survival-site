'''
API для системы кейсов с предметами из базы данных
GET - получить список доступных кейсов
POST - открыть кейс с анимацией прокрутки предметов
'''

import json
import os
from typing import Dict, Any, List
import pymysql
import random

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
            # Получаем предметы из базы для формирования кейсов
            cursor.execute('SELECT loot_name, loot_type, loot_price, loot_quality FROM server_loots LIMIT 100')
            items = cursor.fetchall()
            
            # Формируем кейсы с разными уровнями редкости
            cases = [
                {
                    'id': 1,
                    'name': 'Стартовый кейс',
                    'price_money': 5000,
                    'price_donate': 50,
                    'description': 'Базовые предметы для выживания (до 1000₽)',
                    'image': '📦',
                    'rarity': 'common',
                    'items': [item for item in items if item['loot_price'] and int(item['loot_price']) < 1000][:20]
                },
                {
                    'id': 2,
                    'name': 'Военный кейс',
                    'price_money': 15000,
                    'price_donate': 150,
                    'description': 'Оружие и боеприпасы (1000-5000₽)',
                    'image': '🎖️',
                    'rarity': 'rare',
                    'items': [item for item in items if item['loot_price'] and 1000 <= int(item['loot_price']) < 5000][:20]
                },
                {
                    'id': 3,
                    'name': 'Премиум кейс',
                    'price_money': 50000,
                    'price_donate': 500,
                    'description': 'Эксклюзивные предметы (5000+₽)',
                    'image': '💎',
                    'rarity': 'legendary',
                    'items': [item for item in items if item['loot_price'] and int(item['loot_price']) >= 5000][:20]
                },
                {
                    'id': 4,
                    'name': 'Кейс выживальщика',
                    'price_money': 10000,
                    'price_donate': 100,
                    'description': 'Еда, вода, медикаменты (до 3000₽)',
                    'image': '🏥',
                    'rarity': 'uncommon',
                    'items': [item for item in items if item['loot_type'] and 'food' in str(item['loot_type']).lower()][:20]
                }
            ]
            
            # Добавляем дефолтные предметы если из базы пусто
            for case in cases:
                if len(case['items']) < 5:
                    case['items'] = [
                        {'loot_name': 'Бутылка воды', 'loot_type': 'drink', 'loot_price': 50, 'loot_quality': 100},
                        {'loot_name': 'Консервы', 'loot_type': 'food', 'loot_price': 100, 'loot_quality': 100},
                        {'loot_name': 'Аптечка', 'loot_type': 'medical', 'loot_price': 200, 'loot_quality': 100},
                        {'loot_name': 'Патроны 9мм', 'loot_type': 'ammo', 'loot_price': 150, 'loot_quality': 100},
                        {'loot_name': 'Нож', 'loot_type': 'weapon', 'loot_price': 300, 'loot_quality': 100},
                        {'loot_name': 'Топор', 'loot_type': 'tool', 'loot_price': 500, 'loot_quality': 100},
                        {'loot_name': 'Бинты', 'loot_type': 'medical', 'loot_price': 80, 'loot_quality': 100},
                        {'loot_name': 'Веревка', 'loot_type': 'material', 'loot_price': 120, 'loot_quality': 100},
                    ]
            
            cursor.close()
            connection.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'cases': cases}, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            case_id = body.get('case_id')
            user_id = body.get('user_id')
            payment_method = body.get('payment_method', 'donate')
            
            if not case_id or not user_id:
                cursor.close()
                connection.close()
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'case_id and user_id required'}),
                    'isBase64Encoded': False
                }
            
            # Получаем данные пользователя
            cursor.execute('SELECT u_id, u_name, u_money, u_donate FROM users WHERE u_id = %s', (user_id,))
            user = cursor.fetchone()
            
            if not user:
                cursor.close()
                connection.close()
                return {
                    'statusCode': 404,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'User not found'}),
                    'isBase64Encoded': False
                }
            
            # Получаем предметы для кейса
            cursor.execute('SELECT loot_name, loot_type, loot_price, loot_quality FROM server_loots LIMIT 100')
            all_items = cursor.fetchall()
            
            # Определяем параметры кейса
            case_configs = {
                1: {'price_money': 5000, 'price_donate': 50, 'max_price': 1000, 'min_price': 0},
                2: {'price_money': 15000, 'price_donate': 150, 'max_price': 5000, 'min_price': 1000},
                3: {'price_money': 50000, 'price_donate': 500, 'max_price': 999999, 'min_price': 5000},
                4: {'price_money': 10000, 'price_donate': 100, 'max_price': 3000, 'min_price': 0}
            }
            
            config = case_configs.get(case_id)
            if not config:
                cursor.close()
                connection.close()
                return {
                    'statusCode': 404,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Case not found'}),
                    'isBase64Encoded': False
                }
            
            # Проверяем баланс в зависимости от выбранного способа оплаты
            if payment_method == 'money':
                if user['u_money'] < config['price_money']:
                    cursor.close()
                    connection.close()
                    return {
                        'statusCode': 400,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({'error': 'Недостаточно игровой валюты'}),
                        'isBase64Encoded': False
                    }
            else:
                if user['u_donate'] < config['price_donate']:
                    cursor.close()
                    connection.close()
                    return {
                        'statusCode': 400,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({'error': 'Недостаточно доната'}),
                        'isBase64Encoded': False
                    }
            
            # Списываем валюту в зависимости от выбранного способа оплаты
            if payment_method == 'money':
                cursor.execute('UPDATE users SET u_money = u_money - %s WHERE u_id = %s', 
                             (config['price_money'], user_id))
            else:
                cursor.execute('UPDATE users SET u_donate = u_donate - %s WHERE u_id = %s', 
                             (config['price_donate'], user_id))
            
            # Выбираем случайный предмет с весами
            case_items = [item for item in all_items if item['loot_price'] and config['min_price'] <= int(item['loot_price']) <= config['max_price']]
            
            if not case_items:
                case_items = [
                    {'loot_name': 'Бутылка воды', 'loot_type': 'drink', 'loot_price': 50, 'loot_quality': 100},
                    {'loot_name': 'Консервы', 'loot_type': 'food', 'loot_price': 100, 'loot_quality': 100},
                ]
            
            # Веса: чем дешевле предмет, тем выше шанс
            weights = [1.0 / (int(item['loot_price']) + 1) for item in case_items]
            won_item = random.choices(case_items, weights=weights, k=1)[0]
            
            # Генерируем массив предметов для анимации прокрутки (60 предметов)
            animation_items = []
            for _ in range(60):
                item = random.choices(case_items, weights=weights, k=1)[0]
                animation_items.append(item)
            
            # Вставляем выигрышный предмет в середину (позиция 30)
            animation_items[30] = won_item
            
            # Находим свободный слот в инвентаре
            inventory_columns = [f'u_i_slot_{i}' for i in range(1, 51)]
            cursor.execute(f"SELECT {', '.join(inventory_columns)} FROM users_inventory WHERE u_i_owner = %s", (user_id,))
            inventory = cursor.fetchone()
            
            free_slot = None
            if not inventory:
                # Создаем запись инвентаря если её нет
                cursor.execute("INSERT INTO users_inventory (u_i_owner) VALUES (%s)", (user_id,))
                connection.commit()
                free_slot = 1
            else:
                for i, col in enumerate(inventory_columns, 1):
                    slot_value = inventory[col]
                    # Проверяем пустой слот: None, 0, '0', 'None', пустая строка
                    if slot_value is None or slot_value == 0 or slot_value == '0' or slot_value == 'None' or slot_value == '':
                        free_slot = i
                        break
                
                # Если не нашли свободный слот, значит все заполнены
                if free_slot is None:
                    free_slot = None
            
            # Добавляем предмет в инвентарь
            if free_slot:
                item_data = f"{won_item['loot_name']}|{won_item.get('loot_quality', 100)}"
                cursor.execute(f"UPDATE users_inventory SET u_i_slot_{free_slot} = %s WHERE u_i_owner = %s",
                             (item_data, user_id))
            else:
                # Если инвентарь полон
                connection.commit()
                cursor.close()
                connection.close()
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Инвентарь полон! Освободите место.', 'won_item': dict(won_item)}),
                    'isBase64Encoded': False
                }
            
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
                    'won_item': dict(won_item),
                    'animation_items': [dict(item) for item in animation_items],
                    'inventory_slot': free_slot
                }, default=str),
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