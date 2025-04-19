#!/bin/sh

echo "🛠️ Corrigindo permissões das pastas storage e bootstrap/cache..."

# Corrige permissões
chown -R laravel:laravel /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

echo "✅ Permissões corrigidas. Iniciando o PHP-FPM..."
exec php-fpm -y /usr/local/etc/php-fpm.conf -R
