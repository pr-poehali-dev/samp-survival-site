# Настройка домена death-watch.ru

## Текущая проблема
Домен death-watch.ru показывает ошибку 404. Это означает, что DNS записи настроены неправильно или сервер не знает, что отдавать для этого домена.

## Решение

### 1. Проверьте DNS записи
В панели управления вашего регистратора домена (например, reg.ru, nic.ru) убедитесь, что настроены следующие записи:

```
Тип    Имя               Значение                           TTL
A      death-watch.ru    IP_АДРЕС_ВАШЕГО_СЕРВЕРА           3600
A      www               IP_АДРЕС_ВАШЕГО_СЕРВЕРА           3600
```

Или, если используете CDN/хостинг:

```
Тип     Имя               Значение                          TTL
CNAME   death-watch.ru    ваш-проект.poehali.dev           3600
CNAME   www               ваш-проект.poehali.dev           3600
```

### 2. Настройка на хостинге poehali.dev

В настройках проекта на poehali.dev:

1. Перейдите в **Настройки** → **Домены**
2. Добавьте домен: `death-watch.ru`
3. Добавьте алиас: `www.death-watch.ru`
4. Дождитесь выпуска SSL сертификата (обычно 5-10 минут)

### 3. Если используете собственный сервер

#### Nginx конфигурация:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name death-watch.ru www.death-watch.ru;
    
    # Редирект на HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name death-watch.ru www.death-watch.ru;
    
    # SSL сертификаты (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/death-watch.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/death-watch.ru/privkey.pem;
    
    root /var/www/death-watch/dist;
    index index.html;
    
    # React Router - все запросы на index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Кеширование статики
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Не кешировать HTML
    location ~* \.html$ {
        expires -1;
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate";
    }
}
```

#### Apache конфигурация:

```apache
<VirtualHost *:80>
    ServerName death-watch.ru
    ServerAlias www.death-watch.ru
    Redirect permanent / https://death-watch.ru/
</VirtualHost>

<VirtualHost *:443>
    ServerName death-watch.ru
    ServerAlias www.death-watch.ru
    
    DocumentRoot /var/www/death-watch/dist
    
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/death-watch.ru/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/death-watch.ru/privkey.pem
    
    <Directory /var/www/death-watch/dist>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        # React Router
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
</VirtualHost>
```

### 4. Получение SSL сертификата (Let's Encrypt)

```bash
# Установка certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Для Nginx
sudo certbot --nginx -d death-watch.ru -d www.death-watch.ru

# Для Apache
sudo certbot --apache -d death-watch.ru -d www.death-watch.ru

# Автообновление сертификата
sudo certbot renew --dry-run
```

### 5. Проверка после настройки

```bash
# Проверить DNS
dig death-watch.ru +short
nslookup death-watch.ru

# Проверить доступность
curl -I https://death-watch.ru

# Проверить SSL сертификат
openssl s_client -connect death-watch.ru:443 -servername death-watch.ru
```

## Проблема с белыми кнопками

Исправлено добавлением:
1. ✅ Meta-теги для принудительной перезагрузки кеша
2. ✅ Версионирование стилей (v2.0)
3. ✅ Автоматическая очистка кеша в main.tsx
4. ✅ Скрипт очистки Service Worker кеша

Пользователи должны **обновить страницу с очисткой кеша**: 
- Windows/Linux: `Ctrl + Shift + R` или `Ctrl + F5`
- Mac: `Cmd + Shift + R`

После следующего обновления сайта кеш очистится автоматически у всех пользователей.

## Контакты для помощи

Если проблемы сохраняются:
- Telegram: https://t.me/+QgiLIa1gFRY4Y2Iy
- Техподдержка поехали: https://poehali.dev/support
