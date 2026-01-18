-- Создание таблицы для логов SAMP сервера
CREATE TABLE IF NOT EXISTS samp_logs (
    id SERIAL PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    user_id INTEGER,
    user_name VARCHAR(255),
    action TEXT NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_samp_logs_category ON samp_logs(category);
CREATE INDEX IF NOT EXISTS idx_samp_logs_user_id ON samp_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_samp_logs_created_at ON samp_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_samp_logs_user_name ON samp_logs(user_name);

COMMENT ON TABLE samp_logs IS 'Логи действий на SAMP сервере';
COMMENT ON COLUMN samp_logs.category IS 'Категория: login, logout, kill, death, admin, chat, trade, spawn, etc';