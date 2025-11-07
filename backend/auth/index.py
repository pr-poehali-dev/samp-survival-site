'''
Business: Handle user authentication with external MySQL database
Args: event - dict with httpMethod, body (login/password or action=check_db)
      context - object with request_id attribute
Returns: HTTP response with auth result or database structure
'''

import json
import os
from typing import Dict, Any, Optional
import pymysql
import hashlib

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
            'body': ''
        }
    
    mysql_url = os.environ.get('EXTERNAL_MYSQL_URL', '')
    
    if not mysql_url:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Database URL not configured'})
        }
    
    # Parse mysql://user:pass@host:port/database
    parts = mysql_url.replace('mysql://', '').split('@')
    user_pass = parts[0].split(':')
    host_db = parts[1].split('/')
    host_port = host_db[0].split(':')
    
    connection = pymysql.connect(
        host=host_port[0],
        port=int(host_port[1]) if len(host_port) > 1 else 3306,
        user=user_pass[0],
        password=user_pass[1],
        database=host_db[1],
        cursorclass=pymysql.cursors.DictCursor
    )
    
    cursor = connection.cursor()
    
    # GET - check database structure
    if method == 'GET':
        cursor.execute('SHOW TABLES')
        tables = [list(row.values())[0] for row in cursor.fetchall()]
        
        structure = {}
        for table in tables:
            cursor.execute(f'DESCRIBE {table}')
            structure[table] = cursor.fetchall()
        
        cursor.close()
        connection.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({
                'tables': tables,
                'structure': structure
            }, default=str)
        }
    
    # POST - login
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        login = body_data.get('login', '')
        password = body_data.get('password', '')
        
        if not login or not password:
            cursor.close()
            connection.close()
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Login and password required'})
            }
        
        # Try to find users table (common names)
        cursor.execute('SHOW TABLES')
        tables = [list(row.values())[0] for row in cursor.fetchall()]
        
        users_table = None
        for table in tables:
            if 'user' in table.lower():
                users_table = table
                break
        
        if not users_table:
            cursor.close()
            connection.close()
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'error': 'Users table not found',
                    'available_tables': tables
                })
            }
        
        # Get table structure
        cursor.execute(f'DESCRIBE {users_table}')
        columns = [col['Field'] for col in cursor.fetchall()]
        
        # Try to find login/username column
        login_col = None
        for col in columns:
            if any(x in col.lower() for x in ['login', 'username', 'email', 'user']):
                login_col = col
                break
        
        # Try to find password column
        pass_col = None
        for col in columns:
            if 'pass' in col.lower():
                pass_col = col
                break
        
        if not login_col or not pass_col:
            cursor.close()
            connection.close()
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'error': 'Cannot determine login/password columns',
                    'table': users_table,
                    'columns': columns
                })
            }
        
        # Try authentication with different password hashing methods
        query = f'SELECT * FROM {users_table} WHERE {login_col} = %s'
        cursor.execute(query, (login,))
        user = cursor.fetchone()
        
        cursor.close()
        connection.close()
        
        if not user:
            return {
                'statusCode': 401,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'User not found'})
            }
        
        stored_password = user[pass_col]
        
        # Try different password comparison methods
        password_match = False
        
        # 1. Plain text
        if stored_password == password:
            password_match = True
        
        # 2. MD5
        elif stored_password == hashlib.md5(password.encode()).hexdigest():
            password_match = True
        
        # 3. SHA256
        elif stored_password == hashlib.sha256(password.encode()).hexdigest():
            password_match = True
        
        if not password_match:
            return {
                'statusCode': 401,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Invalid password'})
            }
        
        # Remove password from response
        user_data = {k: v for k, v in user.items() if 'pass' not in k.lower()}
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'user': user_data
            }, default=str)
        }
    
    return {
        'statusCode': 405,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': 'Method not allowed'})
    }
