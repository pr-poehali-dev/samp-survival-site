'''
Управление пользователями из админ-панели
GET - список всех пользователей
POST - обновление данных пользователя (деньги, донат, бан)
DELETE - удаление пользователя
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
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
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
            limit = int(query_params.get('limit', 100))
            offset = int(query_params.get('offset', 0))
            
            # Получаем общее количество пользователей
            cursor.execute('SELECT COUNT(*) as total FROM users')
            total_count = cursor.fetchone()['total']
            
            query = '''
                SELECT 
                    u_id, u_name, u_email, u_date_registration, u_lifetime, 
                    u_money, u_donate, u_score, u_mute, u_ip
                FROM users 
                ORDER BY u_date_registration DESC 
                LIMIT %s OFFSET %s
            '''
            cursor.execute(query, (limit, offset))
            users_raw = cursor.fetchall()
            
            users = []
            for user in users_raw:
                user_dict = dict(user)
                if 'u_date_registration' in user_dict and user_dict['u_date_registration']:
                    user_dict['u_date_registration'] = user_dict['u_date_registration'].isoformat()
                users.append(user_dict)
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'users': users, 'total': total_count, 'limit': limit, 'offset': offset}),
                'isBase64Encoded': False
            }
    
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            user_id = body.get('user_id')
            action = body.get('action')
            
            if not user_id:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'user_id is required'}),
                    'isBase64Encoded': False
                }
            
            if action == 'update':
                updates = []
                values = []
                
                if 'u_money' in body:
                    updates.append('u_money = %s')
                    values.append(body['u_money'])
                
                if 'u_donate' in body:
                    updates.append('u_donate = %s')
                    values.append(body['u_donate'])
                
                if 'u_mute' in body:
                    updates.append('u_mute = %s')
                    values.append(body['u_mute'])
                

                
                if not updates:
                    return {
                        'statusCode': 400,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({'error': 'No fields to update'}),
                        'isBase64Encoded': False
                    }
                
                values.append(user_id)
                query = f"UPDATE users SET {', '.join(updates)} WHERE u_id = %s"
                
                cursor.execute(query, tuple(values))
                connection.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'success': True, 'message': 'User updated successfully'}),
                    'isBase64Encoded': False
                }
            
            else:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Invalid action'}),
                    'isBase64Encoded': False
                }
    
        elif method == 'DELETE':
            query_params = event.get('queryStringParameters', {}) or {}
            user_id = query_params.get('user_id')
            
            if not user_id:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'user_id is required'}),
                    'isBase64Encoded': False
                }
            
            query = "DELETE FROM users WHERE u_id = %s"
            cursor.execute(query, (user_id,))
            connection.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': True, 'message': 'User deleted successfully'}),
                'isBase64Encoded': False
            }
    
        else:
            return {
                'statusCode': 405,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
    finally:
        try:
            cursor.close()
            connection.close()
        except:
            pass