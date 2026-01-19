CREATE TABLE IF NOT EXISTS server_rules (
    id SERIAL PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    rule_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_category ON server_rules(category);
CREATE INDEX IF NOT EXISTS idx_order ON server_rules(rule_order);

INSERT INTO server_rules (category, title, description, rule_order) VALUES
('players', 'Запрещено использование читов и багов', 'Любое использование стороннего ПО для получения преимущества запрещено', 1),
('players', 'Уважайте других игроков', 'Оскорбления, мат и унижения других игроков запрещены', 2),
('players', 'Соблюдайте правила РП-отыгровки', 'Следуйте правилам ролевой игры и не нарушайте атмосферу', 3),
('factions', 'Захват территорий только в определённое время', 'Войны фракций проводятся только в назначенное время администрацией', 1),
('factions', 'Соблюдайте устав своей фракции', 'Каждая фракция имеет свой устав, который обязателен к выполнению', 2),
('factions', 'Кооперация между кланами разрешена', 'Вы можете объединяться с другими фракциями для достижения общих целей', 3),
('general', 'Запрещён спам и флуд в чате', 'Не засоряйте чат бессмысленными сообщениями', 1),
('general', 'Реклама других серверов запрещена', 'Любая реклама сторонних проектов карается баном', 2),
('general', 'Прислушивайтесь к администрации', 'Решения администрации являются окончательными', 3);
