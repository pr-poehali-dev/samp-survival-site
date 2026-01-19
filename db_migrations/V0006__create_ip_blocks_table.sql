-- Таблица для отслеживания блокировок IP-адресов
CREATE TABLE ip_blocks (
    id SERIAL PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL UNIQUE,
    failed_attempts INT DEFAULT 0,
    temp_blocked_until TIMESTAMP,
    permanently_blocked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индекс для быстрого поиска по IP
CREATE INDEX idx_ip_address ON ip_blocks(ip_address);

-- Индекс для поиска временно заблокированных
CREATE INDEX idx_temp_blocked ON ip_blocks(temp_blocked_until) WHERE temp_blocked_until IS NOT NULL;