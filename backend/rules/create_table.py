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

create_table_sql = '''
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
'''

cursor.execute(create_table_sql)

insert_sql = '''
INSERT INTO server_rules (category, title, description, rule_order) VALUES
(%s, %s, %s, %s)
'''

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
    cursor.execute(insert_sql, rule)

connection.commit()
cursor.close()
connection.close()

print('Таблица server_rules создана и заполнена!')
