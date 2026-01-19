-- Сброс блокировки для IP пользователя Rainold_Star
UPDATE t_p38718569_samp_survival_site.ip_blocks 
SET failed_attempts = 0, 
    temp_blocked_until = NULL, 
    permanently_blocked = false,
    updated_at = CURRENT_TIMESTAMP
WHERE ip_address = '158.160.16.200';