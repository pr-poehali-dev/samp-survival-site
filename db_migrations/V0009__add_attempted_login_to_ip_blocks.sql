-- Добавляем колонку для хранения последнего логина, по которому пытались войти с IP
ALTER TABLE ip_blocks ADD COLUMN attempted_login VARCHAR(255);