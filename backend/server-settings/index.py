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
        user_id = body_data.get('user_id')
        updates = body_data.get('settings', {})
        
        if not user_id:
            return {
                'statusCode': 401,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'User ID required'}),
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
            
            mysql_cursor.execute('SHOW TABLES')
            tables = [list(row.values())[0] for row in mysql_cursor.fetchall()]
            
            users_table = None
            for table in tables:
                if 'user' in table.lower() and 'admin' not in table.lower():
                    users_table = table
                    break
            
            if not users_table:
                mysql_cursor.close()
                mysql_conn.close()
                return {
                    'statusCode': 500,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Users table not found'}),
                    'isBase64Encoded': False
                }
            
            mysql_cursor.execute(f'DESCRIBE {users_table}')
            columns = [col['Field'] for col in mysql_cursor.fetchall()]
            
            id_col = None
            for col in columns:
                if col.lower() in ['id', 'u_id', 'user_id']:
                    id_col = col
                    break
            
            admin_col = None
            for col in columns:
                if 'admin' in col.lower():
                    admin_col = col
                    break
            
            if not id_col or not admin_col:
                mysql_cursor.close()
                mysql_conn.close()
                return {
                    'statusCode': 500,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Cannot find ID or admin column'}),
                    'isBase64Encoded': False
                }
            
            query = f'SELECT {admin_col} FROM {users_table} WHERE {id_col} = %s'
            mysql_cursor.execute(query, (user_id,))
            result = mysql_cursor.fetchone()
            
            mysql_cursor.close()
            mysql_conn.close()
            
            if not result:
                return {
                    'statusCode': 404,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'User not found'}),
                    'isBase64Encoded': False
                }
            
            admin_level = result[admin_col]
            
            if admin_level < 6:
                return {
                    'statusCode': 403,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Access denied. Admin level 6+ required'}),
                    'isBase64Encoded': False
                }
            
            pg_conn = psycopg2.connect(pg_dsn)
            pg_cursor = pg_conn.cursor()
            
            for key, value in updates.items():
                pg_cursor.execute(
                    'UPDATE t_p38718569_samp_survival_site.server_settings SET setting_value = %s, updated_at = CURRENT_TIMESTAMP WHERE setting_key = %s',
                    (value, key)
                )
            
            pg_conn.commit()
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
