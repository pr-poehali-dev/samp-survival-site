'''
Управление настройками сервера
GET - получить все настройки
POST - обновить настройки (только для админов 6+ уровня)
'''

import json
import os
from typing import Dict, Any
import psycopg2
import pymysql

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
    
    pg_dsn = os.environ.get('DATABASE_URL', '')
    
    if method == 'GET':
        try:
            pg_conn = psycopg2.connect(pg_dsn)
            pg_cursor = pg_conn.cursor()
            
            pg_cursor.execute('SELECT setting_key, setting_value FROM t_p38718569_samp_survival_site.server_settings')
            settings = {row[0]: row[1] for row in pg_cursor.fetchall()}
            
            pg_cursor.close()
            pg_conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(settings),
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
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        username = body_data.get('username')
        updates = body_data.get('settings', {})
        
        print(f'DEBUG POST: username={username}, updates={updates}')
        
        if not username:
            print('ERROR: Username not provided')
            return {
                'statusCode': 401,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Username required'}),
                'isBase64Encoded': False
            }
        
        mysql_url = 'mysql://gs303055:cheburashka@80.242.59.112:3306/gs303055'
        parts = mysql_url.replace('mysql://', '').split('@')
        user_pass = parts[0].split(':')
        host_db = parts[1].split('/')
        host_port = host_db[0].split(':')
        
        try:
            mysql_conn = pymysql.connect(
                host=host_port[0],
                port=int(host_port[1]) if len(host_port) > 1 else 3306,
                user=user_pass[0],
                password=user_pass[1],
                database=host_db[1],
                cursorclass=pymysql.cursors.DictCursor,
                connect_timeout=5
            )
            
            mysql_cursor = mysql_conn.cursor()
            
            mysql_cursor.execute('SELECT admin_level FROM users_admins WHERE u_a_name = %s', (username,))
            result = mysql_cursor.fetchone()
            print(f'DEBUG: Admin check result for {username}: {result}')
            
            mysql_cursor.close()
            mysql_conn.close()
            
            if not result:
                print(f'ERROR: User {username} not found in users_admins')
                return {
                    'statusCode': 404,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'User not found or not admin'}),
                    'isBase64Encoded': False
                }
            
            admin_level = result.get('admin_level', 0)
            print(f'DEBUG: Admin level: {admin_level}')
            
            if admin_level < 6:
                print(f'ERROR: Access denied for level {admin_level}')
                return {
                    'statusCode': 403,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Access denied. Admin level 6+ required'}),
                    'isBase64Encoded': False
                }
            
            print('DEBUG: Connecting to PostgreSQL...')
            pg_conn = psycopg2.connect(pg_dsn)
            pg_cursor = pg_conn.cursor()
            
            print(f'DEBUG: Updating {len(updates)} settings...')
            for key, value in updates.items():
                print(f'DEBUG: Updating {key} = {value}')
                pg_cursor.execute(
                    'UPDATE t_p38718569_samp_survival_site.server_settings SET setting_value = %s, updated_at = CURRENT_TIMESTAMP WHERE setting_key = %s',
                    (value, key)
                )
            
            pg_conn.commit()
            print('DEBUG: Settings committed successfully')
            pg_cursor.close()
            pg_conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': True, 'message': 'Settings updated'}),
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
    
    return {
        'statusCode': 405,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }