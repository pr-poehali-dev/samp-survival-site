import pymysql

mysql_url = 'mysql://gs303055:cheburashka@80.242.59.112:3306/gs303055'

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
    cursorclass=pymysql.cursors.DictCursor,
    connect_timeout=5
)

cursor = connection.cursor()

print("=== Проверка и создание поля u_last_action ===")
try:
    cursor.execute("""
        ALTER TABLE users 
        ADD COLUMN u_last_action INT DEFAULT 0
    """)
    connection.commit()
    print("✅ Поле u_last_action создано!")
except Exception as e:
    if 'Duplicate column' in str(e):
        print("✅ Поле u_last_action уже существует")
    else:
        print(f"❌ Ошибка: {e}")

print("\n=== Создание таблицы cases_config ===")
try:
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS cases_config (
            case_id INT PRIMARY KEY,
            case_name VARCHAR(100) NOT NULL,
            price_money INT DEFAULT 5000,
            price_donate INT DEFAULT 50,
            description VARCHAR(255),
            rarity VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ''')
    print("✅ Таблица cases_config создана!")
    
    cursor.execute('SELECT COUNT(*) as count FROM cases_config')
    count = cursor.fetchone()['count']
    
    if count == 0:
        cursor.execute('''
            INSERT INTO cases_config (case_id, case_name, price_money, price_donate, description, rarity) VALUES
            (1, 'Стартовый кейс', 5000, 50, 'Базовые предметы для выживания', 'common'),
            (2, 'Военный кейс', 15000, 150, 'Оружие и боеприпасы', 'rare'),
            (3, 'Премиум кейс', 50000, 500, 'Эксклюзивные предметы', 'legendary'),
            (4, 'Кейс выживальщика', 10000, 100, 'Еда, вода, медикаменты', 'uncommon')
        ''')
        print("✅ Добавлены дефолтные кейсы!")
    else:
        print(f"✅ Уже есть {count} кейсов в базе")
    
    connection.commit()
except Exception as e:
    print(f"❌ Ошибка: {e}")

print("\n=== Добавление поля drop_chance в server_loots ===")
try:
    cursor.execute('''
        ALTER TABLE server_loots 
        ADD COLUMN drop_chance DECIMAL(5,2) DEFAULT 1.0
    ''')
    connection.commit()
    print("✅ Поле drop_chance создано!")
except Exception as e:
    if 'Duplicate column' in str(e):
        print("✅ Поле drop_chance уже существует")
    else:
        print(f"❌ Ошибка: {e}")

cursor.close()
connection.close()

print("\n✅ Все готово!")
