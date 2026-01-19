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

# Создаем таблицу конфигурации кейсов
create_cases_config = '''
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
'''

cursor.execute(create_cases_config)

# Добавляем поле drop_chance в server_loots если его нет
try:
    cursor.execute('''
        ALTER TABLE server_loots 
        ADD COLUMN drop_chance DECIMAL(5,2) DEFAULT 1.0
    ''')
except:
    print('drop_chance уже существует')

# Вставляем дефолтные кейсы
insert_cases = '''
INSERT INTO cases_config (case_id, case_name, price_money, price_donate, description, rarity) VALUES
(1, 'Стартовый кейс', 5000, 50, 'Базовые предметы для выживания', 'common'),
(2, 'Военный кейс', 15000, 150, 'Оружие и боеприпасы', 'rare'),
(3, 'Премиум кейс', 50000, 500, 'Эксклюзивные предметы', 'legendary'),
(4, 'Кейс выживальщика', 10000, 100, 'Еда, вода, медикаменты', 'uncommon')
ON DUPLICATE KEY UPDATE 
    price_money=VALUES(price_money),
    price_donate=VALUES(price_donate)
'''

cursor.execute(insert_cases)

connection.commit()
cursor.close()
connection.close()

print('Таблицы созданы и заполнены!')
