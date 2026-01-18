CREATE TABLE IF NOT EXISTS server_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO server_settings (setting_key, setting_value) VALUES
    ('server_name', 'SURVIVAL RP'),
    ('discord_link', 'https://discord.gg/survival'),
    ('vk_link', 'https://vk.com/survival'),
    ('forum_link', 'https://forum.survival-rp.com')
ON CONFLICT (setting_key) DO NOTHING;
