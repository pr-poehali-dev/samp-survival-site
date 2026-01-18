'''
Система логирования для SAMP сервера
POST - добавить лог
GET - получить логи с фильтрацией по категории
'''

import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime

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
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'DATABASE_URL not configured'}),
            'isBase64Encoded': False
        }
    
    try:
        connection = psycopg2.connect(dsn)
        cursor = connection.cursor(cursor_factory=RealDictCursor)
        
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            category = body.get('category', 'general')
            user_id = body.get('user_id')
            user_name = body.get('user_name')
            action = body.get('action', '')
            details = body.get('details')
            ip_address = body.get('ip_address')
            
            if not action:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'action is required'}),
                    'isBase64Encoded': False
                }
            
            query = '''
                INSERT INTO samp_logs 
                (category, user_id, user_name, action, details, ip_address) 
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id, created_at
            '''
            
            cursor.execute(query, (category, user_id, user_name, action, details, ip_address))
            result = cursor.fetchone()
            connection.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'success': True,
                    'log_id': result['id'],
                    'created_at': result['created_at'].isoformat()
                }),
                'isBase64Encoded': False
            }
        
        elif method == 'GET':
            query_params = event.get('queryStringParameters', {}) or {}
            
            category = query_params.get('category')
            user_id = query_params.get('user_id')
            user_name = query_params.get('user_name')
            limit = int(query_params.get('limit', 100))
            offset = int(query_params.get('offset', 0))
            
            conditions = []
            params = []
            
            if category:
                conditions.append('category = %s')
                params.append(category)
            
            if user_id:
                conditions.append('user_id = %s')
                params.append(int(user_id))
            
            if user_name:
                conditions.append('user_name ILIKE %s')
                params.append(f'%{user_name}%')
            
            where_clause = ' AND '.join(conditions) if conditions else '1=1'
            
            query = f'''
                SELECT id, category, user_id, user_name, action, details, ip_address, created_at
                FROM samp_logs
                WHERE {where_clause}
                ORDER BY created_at DESC
                LIMIT %s OFFSET %s
            '''
            
            params.extend([limit, offset])
            cursor.execute(query, tuple(params))
            logs = cursor.fetchall()
            
            count_query = f'SELECT COUNT(*) as total FROM samp_logs WHERE {where_clause}'
            cursor.execute(count_query, tuple(params[:-2]))
            total = cursor.fetchone()['total']
            
            logs_list = []
            for log in logs:
                log_dict = dict(log)
                if log_dict['created_at']:
                    log_dict['created_at'] = log_dict['created_at'].isoformat()
                logs_list.append(log_dict)
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'logs': logs_list,
                    'total': total,
                    'limit': limit,
                    'offset': offset
                }),
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
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': f'Server error: {str(e)}'}),
            'isBase64Encoded': False
        }
    
    finally:
        try:
            cursor.close()
            connection.close()
        except:
            pass
