/*
    SAMP Server Integration Example
    Пример интеграции логирования SAMP сервера с системой логов
    
    Установка:
    1. Добавьте этот код в ваш gamemode
    2. Включите плагин samphttp или requests для HTTP запросов
    3. Замените API_URL на ваш URL функции samp-logs
*/

#define API_URL "https://functions.poehali.dev/87a1d7ee-a438-4ee1-bb8b-40f381ca8de7"

// Функция отправки лога на сервер
stock SendLogToServer(const category[], playerid = -1, const action[], const details[] = "")
{
    new jsonData[512];
    new playerName[MAX_PLAYER_NAME];
    new playerIP[16];
    
    if(playerid != -1 && IsPlayerConnected(playerid))
    {
        GetPlayerName(playerid, playerName, sizeof(playerName));
        GetPlayerIp(playerid, playerIP, sizeof(playerIP));
        
        format(jsonData, sizeof(jsonData), 
            "{\"category\":\"%s\",\"user_id\":%d,\"user_name\":\"%s\",\"action\":\"%s\",\"details\":\"%s\",\"ip_address\":\"%s\"}",
            category, playerid, playerName, action, details, playerIP
        );
    }
    else
    {
        format(jsonData, sizeof(jsonData), 
            "{\"category\":\"%s\",\"action\":\"%s\",\"details\":\"%s\"}",
            category, action, details
        );
    }
    
    // Используйте ваш HTTP плагин для POST запроса
    // Пример с плагином requests:
    // HTTP(0, HTTP_POST, API_URL, jsonData, "OnLogSent");
    
    return 1;
}

// Callback после отправки лога
forward OnLogSent(index, response_code, data[]);
public OnLogSent(index, response_code, data[])
{
    if(response_code == 200)
    {
        printf("[LOG] Лог успешно отправлен на сервер");
    }
    else
    {
        printf("[LOG] Ошибка отправки лога: код %d", response_code);
    }
    return 1;
}

// ============================================
// ПРИМЕРЫ ИСПОЛЬЗОВАНИЯ В GAMEMODE
// ============================================

// При входе игрока
public OnPlayerConnect(playerid)
{
    new playerName[MAX_PLAYER_NAME];
    GetPlayerName(playerid, playerName, sizeof(playerName));
    
    new details[128];
    format(details, sizeof(details), "Игрок %s подключился к серверу", playerName);
    
    SendLogToServer("login", playerid, "Вход на сервер", details);
    
    return 1;
}

// При выходе игрока
public OnPlayerDisconnect(playerid, reason)
{
    new playerName[MAX_PLAYER_NAME];
    GetPlayerName(playerid, playerName, sizeof(playerName));
    
    new details[128];
    new reasonText[32];
    
    switch(reason)
    {
        case 0: reasonText = "Таймаут/Краш";
        case 1: reasonText = "Выход";
        case 2: reasonText = "Кик/Бан";
    }
    
    format(details, sizeof(details), "Игрок %s отключился. Причина: %s", playerName, reasonText);
    
    SendLogToServer("logout", playerid, "Выход с сервера", details);
    
    return 1;
}

// При убийстве
public OnPlayerDeath(playerid, killerid, reason)
{
    if(killerid != INVALID_PLAYER_ID)
    {
        new killerName[MAX_PLAYER_NAME], victimName[MAX_PLAYER_NAME];
        GetPlayerName(killerid, killerName, sizeof(killerName));
        GetPlayerName(playerid, victimName, sizeof(victimName));
        
        new details[256];
        format(details, sizeof(details), "%s убил %s (Оружие: %d)", killerName, victimName, reason);
        
        SendLogToServer("kill", killerid, "Убийство игрока", details);
    }
    
    new victimName[MAX_PLAYER_NAME];
    GetPlayerName(playerid, victimName, sizeof(victimName));
    
    new details[128];
    format(details, sizeof(details), "Игрок %s погиб", victimName);
    
    SendLogToServer("death", playerid, "Смерть игрока", details);
    
    return 1;
}

// При сообщении в чате
public OnPlayerText(playerid, text[])
{
    new playerName[MAX_PLAYER_NAME];
    GetPlayerName(playerid, playerName, sizeof(playerName));
    
    new details[256];
    format(details, sizeof(details), "Сообщение в чат: %s", text);
    
    SendLogToServer("chat", playerid, "Чат", details);
    
    return 1;
}

// При спавне
public OnPlayerSpawn(playerid)
{
    new playerName[MAX_PLAYER_NAME];
    GetPlayerName(playerid, playerName, sizeof(playerName));
    
    new Float:x, Float:y, Float:z;
    GetPlayerPos(playerid, x, y, z);
    
    new details[256];
    format(details, sizeof(details), "Спавн в координатах: %.2f, %.2f, %.2f", x, y, z);
    
    SendLogToServer("spawn", playerid, "Спавн игрока", details);
    
    return 1;
}

// Админ команды
CMD:ban(playerid, params[])
{
    if(PlayerInfo[playerid][pAdmin] < 1) return SendClientMessage(playerid, -1, "У вас нет прав");
    
    new targetid;
    if(sscanf(params, "u", targetid)) return SendClientMessage(playerid, -1, "/ban [id]");
    
    new adminName[MAX_PLAYER_NAME], targetName[MAX_PLAYER_NAME];
    GetPlayerName(playerid, adminName, sizeof(adminName));
    GetPlayerName(targetid, targetName, sizeof(targetName));
    
    new details[256];
    format(details, sizeof(details), "Админ %s забанил игрока %s", adminName, targetName);
    
    SendLogToServer("admin", playerid, "Бан игрока", details);
    
    // Ваш код бана...
    
    return 1;
}

// Торговля между игроками
stock TradeItem(playerid, targetid, itemid, price)
{
    new playerName[MAX_PLAYER_NAME], targetName[MAX_PLAYER_NAME];
    GetPlayerName(playerid, playerName, sizeof(playerName));
    GetPlayerName(targetid, targetName, sizeof(targetName));
    
    new details[256];
    format(details, sizeof(details), "%s продал предмет #%d игроку %s за $%d", 
        playerName, itemid, targetName, price);
    
    SendLogToServer("trade", playerid, "Торговля", details);
    
    // Ваш код торговли...
    
    return 1;
}

/*
    КАТЕГОРИИ ЛОГОВ:
    - login    - Входы на сервер
    - logout   - Выходы с сервера
    - kill     - Убийства
    - death    - Смерти
    - admin    - Действия администраторов
    - chat     - Сообщения в чате
    - trade    - Торговля между игроками
    - spawn    - Спавны игроков
    - command  - Использование команд
    - money    - Транзакции с деньгами
    - vehicle  - Действия с транспортом
*/
