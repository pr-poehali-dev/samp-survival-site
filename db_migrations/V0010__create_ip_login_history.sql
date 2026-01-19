-- Создаем таблицу для истории попыток входа с привязкой к IP
CREATE TABLE IF NOT EXISTS ip_login_history (
    id SERIAL PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL,
    login VARCHAR(255) NOT NULL,
    success BOOLEAN NOT NULL,
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ip_login_history_ip ON ip_login_history(ip_address);
CREATE INDEX idx_ip_login_history_login ON ip_login_history(login);