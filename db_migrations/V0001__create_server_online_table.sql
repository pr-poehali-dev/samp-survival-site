CREATE TABLE server_online (
    id SERIAL PRIMARY KEY,
    player_count INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO server_online (player_count) VALUES (847);