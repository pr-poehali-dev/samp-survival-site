'''
API для управления правилами сервера
GET - получить все правила
POST - добавить/обновить правило (только для админов)
DELETE - удалить правило (только для админов)
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
                'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
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
        # Создаем таблицу если её нет
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS server_rules (
                id INT AUTO_INCREMENT PRIMARY KEY,
                category VARCHAR(100) NOT NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                rule_order INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_category (category),
                INDEX idx_order (rule_order)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ''')
        
        # Проверяем есть ли правила, если нет - добавляем дефолтные
        cursor.execute('SELECT COUNT(*) as count FROM server_rules')
        count_result = cursor.fetchone()
        
        if count_result['count'] == 0:
            default_rules = [
                ('players', 'Запрещено использование читов и багов', 'Любое использование стороннего ПО для получения преимущества запрещено', 1),
                ('players', 'Уважайте других игроков', 'Оскорбления, мат и унижения других игроков запрещены', 2),
                ('players', 'Соблюдайте правила РП-отыгровки', 'Следуйте правилам ролевой игры и не нарушайте атмосферу', 3),
                ('factions', 'Захват территорий только в определённое время', 'Войны фракций проводятся только в назначенное время администрацией', 1),
                ('factions', 'Соблюдайте устав своей фракции', 'Каждая фракция имеет свой устав, который обязателен к выполнению', 2),
                ('factions', 'Кооперация между кланами разрешена', 'Вы можете объединяться с другими фракциями для достижения общих целей', 3),
                ('general', 'Запрещён спам и флуд в чате', 'Не засоряйте чат бессмысленными сообщениями', 1),
                ('general', 'Реклама других серверов запрещена', 'Любая реклама сторонних проектов карается баном', 2),
                ('general', 'Прислушивайтесь к администрации', 'Решения администрации являются окончательными', 3),
            ]
            
            for rule in default_rules:
                cursor.execute(
                    'INSERT INTO server_rules (category, title, description, rule_order) VALUES (%s, %s, %s, %s)',
                    rule
                )
            connection.commit()
        
        if method == 'GET':
            cursor.execute('SELECT * FROM server_rules ORDER BY category, rule_order')
            rules = cursor.fetchall()
            
            cursor.close()
            connection.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'rules': rules}, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            username = body.get('username')
            category = body.get('category')
            title = body.get('title')
            description = body.get('description')
            rule_order = body.get('rule_order', 0)
            rule_id = body.get('rule_id')
            
            if not username:
                cursor.close()
                connection.close()
                return {
                    'statusCode': 401,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'username required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute('SELECT admin_level FROM users_admins WHERE u_a_name = %s', (username,))
            admin = cursor.fetchone()
            
            if not admin or admin['admin_level'] < 6:
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
            
            if rule_id:
                cursor.execute(
                    'UPDATE server_rules SET category=%s, title=%s, description=%s, rule_order=%s WHERE id=%s',
                    (category, title, description, rule_order, rule_id)
                )
            else:
                cursor.execute(
                    'INSERT INTO server_rules (category, title, description, rule_order) VALUES (%s, %s, %s, %s)',
                    (category, title, description, rule_order)
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
        
        elif method == 'DELETE':
            body = json.loads(event.get('body', '{}'))
            username = body.get('username')
            rule_id = body.get('rule_id')
            
            if not username or not rule_id:
                cursor.close()
                connection.close()
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'username and rule_id required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute('SELECT admin_level FROM users_admins WHERE u_a_name = %s', (username,))
            admin = cursor.fetchone()
            
            if not admin or admin['admin_level'] < 6:
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
            
            cursor.execute('DELETE FROM server_rules WHERE id = %s', (rule_id,))
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
        print(f"ERROR in rules handler: {e}")
        import traceback
        traceback.print_exc()
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