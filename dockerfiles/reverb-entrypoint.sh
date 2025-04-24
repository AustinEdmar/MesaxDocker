#!/bin/sh
set -e

# Ajusta as permissões para o usuário laravel
chown -R laravel:laravel /var/www/html/storage
chmod -R 775 /var/www/html/storage

# Executa o comando como usuário laravel
su laravel -c "cd /var/www/html && php artisan reverb:start --port=8081 --host=0.0.0.0"

exec "$@"