'''
Авторизация пользователей через внешнюю MySQL базу данных
Принимает: POST с login и password, GET для проверки структуры БД или онлайна сервера
Возвращает: данные пользователя, информацию о таблицах или онлайн сервера
'''

import json
import os
from typing import Dict, Any
import pymysql
import hashlib
import socket
import struct

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
    
    if method == 'GET':
        # Проверка онлайна сервера если передан параметр check=online
        query_params = event.get('queryStringParameters', {}) or {}
        check_param = query_params.get('check', '')
        
        if check_param == 'online':
            cursor.close()
            connection.close()
            
            server_ip = '80.242.59.112'
            server_port = 2073
            
            try:
                # SA-MP query протокол
                sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
                sock.settimeout(2)
                
                # Формат пакета: SAMP + IP в байтах + порт (2 байта) + opcode 'i' (info)
                ip_parts = [int(x) for x in server_ip.split('.')]
                packet = b'SAMP' + bytes(ip_parts) + struct.pack('<H', server_port) + b'i'
                
                sock.sendto(packet, (server_ip, server_port))
                data, _ = sock.recvfrom(1024)
                sock.close()
                
                # Парсинг ответа
                offset = 11
                password = data[offset]
                offset += 1
                
                players = struct.unpack('<H', data[offset:offset+2])[0]
                offset += 2
                maxplayers = struct.unpack('<H', data[offset:offset+2])[0]
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'online': players,
                        'maxPlayers': maxplayers
                    }),
                    'isBase64Encoded': False
                }
                
            except Exception:
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'online': 0,
                        'maxPlayers': 100
                    }),
                    'isBase64Encoded': False
                }
        
        # Обычный GET - структура БД
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
                'body': json.dumps({'error': 'Login and password required'}),
                'isBase64Encoded': False
            }
        
        cursor.execute('SHOW TABLES')
        tables = [list(row.values())[0] for row in cursor.fetchall()]
        
        users_table = None
        for table in tables:
            if 'user' in table.lower() or 'account' in table.lower() or 'player' in table.lower():
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
                }),
                'isBase64Encoded': False
            }
        
        cursor.execute(f'DESCRIBE {users_table}')
        columns = [col['Field'] for col in cursor.fetchall()]
        
        login_col = None
        for col in columns:
            if any(x in col.lower() for x in ['login', 'username', 'email', 'user', 'name']):
                login_col = col
                break
        
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
                }),
                'isBase64Encoded': False
            }
        
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
                'body': json.dumps({'error': 'User not found'}),
                'isBase64Encoded': False
            }
        
        stored_password = user[pass_col]
        password_match = False
        
        if stored_password == password:
            password_match = True
        elif stored_password == hashlib.md5(password.encode()).hexdigest():
            password_match = True
        elif stored_password == hashlib.sha256(password.encode()).hexdigest():
            password_match = True
        
        if not password_match:
            return {
                'statusCode': 401,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Invalid password'}),
                'isBase64Encoded': False
            }
        
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
            }, default=str),
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