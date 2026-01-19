'''
Защита от брутфорса: отслеживание попыток входа и блокировка IP
Принимает: POST check_block, POST record_attempt, POST unblock, POST list_blocks
Возвращает: статус блокировки IP-адреса и список заблокированных IP
'''

import json
import os
from datetime import datetime, timedelta
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
    ip_address = body_data.get('ip', '')
    
    if not ip_address:
        source_ip = event.get('requestContext', {}).get('identity', {}).get('sourceIp', '')
        ip_address = source_ip
    
    if not ip_address:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'IP address required'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if action == 'check_block':
            cursor.execute('''
                SELECT ip_address, failed_attempts, temp_blocked_until, permanently_blocked
                FROM ip_blocks
                WHERE ip_address = %s
            ''', (ip_address,))
            
            result = cursor.fetchone()
            
            if not result:
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'blocked': False,
                        'reason': None,
                        'attempts': 0
                    }),
                    'isBase64Encoded': False
                }
            
            if result['permanently_blocked']:
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'blocked': True,
                        'reason': 'permanent',
                        'message': 'Ваш IP заблокирован навсегда. Обратитесь к администратору.'
                    }),
                    'isBase64Encoded': False
                }
            
            if result['temp_blocked_until']:
                blocked_until = result['temp_blocked_until']
                if isinstance(blocked_until, str):
                    blocked_until = datetime.fromisoformat(blocked_until)
                
                if blocked_until > datetime.now():
                    time_left = blocked_until - datetime.now()
                    hours = int(time_left.total_seconds() // 3600)
                    minutes = int((time_left.total_seconds() % 3600) // 60)
                    
                    return {
                        'statusCode': 200,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({
                            'blocked': True,
                            'reason': 'temporary',
                            'message': f'Доступ временно заблокирован. Осталось: {hours}ч {minutes}мин',
                            'blocked_until': blocked_until.isoformat()
                        }),
                        'isBase64Encoded': False
                    }
                else:
                    cursor.execute('''
                        UPDATE ip_blocks
                        SET failed_attempts = 0, temp_blocked_until = NULL, updated_at = CURRENT_TIMESTAMP
                        WHERE ip_address = %s
                    ''', (ip_address,))
                    conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'blocked': False,
                    'reason': None,
                    'attempts': result['failed_attempts']
                }),
                'isBase64Encoded': False
            }
        
        elif action == 'record_attempt':
            success = body_data.get('success', False)
            login = body_data.get('login', '')
            
            if success:
                cursor.execute('''
                    UPDATE ip_blocks
                    SET failed_attempts = 0, temp_blocked_until = NULL, updated_at = CURRENT_TIMESTAMP
                    WHERE ip_address = %s
                ''', (ip_address,))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'success': True, 'attempts_reset': True}),
                    'isBase64Encoded': False
                }
            
            cursor.execute('''
                INSERT INTO ip_blocks (ip_address, failed_attempts, attempted_login)
                VALUES (%s, 1, %s)
                ON CONFLICT (ip_address) 
                DO UPDATE SET 
                    failed_attempts = ip_blocks.failed_attempts + 1,
                    attempted_login = %s,
                    updated_at = CURRENT_TIMESTAMP
                RETURNING failed_attempts, permanently_blocked
            ''', (ip_address, login, login))
            
            result = cursor.fetchone()
            attempts = result['failed_attempts']
            
            if attempts >= 5:
                cursor.execute('''
                    UPDATE ip_blocks
                    SET permanently_blocked = TRUE, updated_at = CURRENT_TIMESTAMP
                    WHERE ip_address = %s
                ''', (ip_address,))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'blocked': True,
                        'reason': 'permanent',
                        'attempts': attempts,
                        'message': 'IP заблокирован навсегда после 5 попыток'
                    }),
                    'isBase64Encoded': False
                }
            
            elif attempts >= 3:
                blocked_until = datetime.now() + timedelta(hours=3)
                
                cursor.execute('''
                    UPDATE ip_blocks
                    SET temp_blocked_until = %s, updated_at = CURRENT_TIMESTAMP
                    WHERE ip_address = %s
                ''', (blocked_until, ip_address))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'blocked': True,
                        'reason': 'temporary',
                        'attempts': attempts,
                        'message': 'IP заблокирован на 3 часа после 3 попыток',
                        'blocked_until': blocked_until.isoformat()
                    }),
                    'isBase64Encoded': False
                }
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'blocked': False,
                    'attempts': attempts,
                    'remaining': 3 - attempts
                }),
                'isBase64Encoded': False
            }
        
        elif action == 'list_blocks':
            cursor.execute('''
                SELECT id, ip_address, failed_attempts, temp_blocked_until, 
                       permanently_blocked, attempted_login, created_at, updated_at
                FROM ip_blocks
                ORDER BY updated_at DESC
            ''')
            
            blocks = cursor.fetchall()
            blocks_list = []
            
            for block in blocks:
                block_dict = dict(block)
                if block_dict['temp_blocked_until']:
                    block_dict['temp_blocked_until'] = block_dict['temp_blocked_until'].isoformat()
                if block_dict['created_at']:
                    block_dict['created_at'] = block_dict['created_at'].isoformat()
                if block_dict['updated_at']:
                    block_dict['updated_at'] = block_dict['updated_at'].isoformat()
                blocks_list.append(block_dict)
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'blocks': blocks_list}),
                'isBase64Encoded': False
            }
        
        elif action == 'unblock':
            cursor.execute('''
                UPDATE ip_blocks
                SET failed_attempts = 0, 
                    temp_blocked_until = NULL, 
                    permanently_blocked = FALSE,
                    updated_at = CURRENT_TIMESTAMP
                WHERE ip_address = %s
            ''', (ip_address,))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': True, 'message': 'IP разблокирован'}),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': f'Unknown action: {action}'}),
                'isBase64Encoded': False
            }
    
    finally:
        cursor.close()
        conn.close()