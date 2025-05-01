FROM php:8-fpm-alpine

ARG UID
ARG GID

ENV UID=${UID:-1000}
ENV GID=${GID:-1000}

# Instalar dependências do sistema
RUN apk add --no-cache \
    bash \
    libpng \
    libpng-dev \
    libjpeg-turbo \
    libjpeg-turbo-dev \
    libwebp-dev \
    libxpm-dev \
    freetype \
    freetype-dev \
    zip \
    unzip \
    icu-dev \
    oniguruma-dev \
    linux-headers \
    libzip-dev \
    git \
    $PHPIZE_DEPS

# Instalar extensão mbstring explicitamente
RUN apk add --no-cache oniguruma-dev && \
    docker-php-ext-install mbstring

# Instalar outras extensões necessárias
RUN docker-php-ext-install pdo pdo_mysql
RUN docker-php-ext-install fileinfo
RUN docker-php-ext-install ctype
RUN docker-php-ext-install intl
RUN docker-php-ext-install bcmath
RUN docker-php-ext-install zip
RUN pecl install redis && docker-php-ext-enable redis

# Configurar e instalar GD com suporte para vários formatos
RUN docker-php-ext-configure gd --with-freetype --with-jpeg
RUN docker-php-ext-install gd

# Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/local/bin/composer

# Criar usuário e grupo para o Laravel
RUN addgroup -g ${GID} laravel && \
    adduser -u ${UID} -G laravel -s /bin/sh -D laravel

# Definir diretório de trabalho
WORKDIR /var/www/html

# Expor porta
EXPOSE 8000

# Configurar limites de upload
RUN echo "upload_max_filesize = 5M" > /usr/local/etc/php/conf.d/uploads.ini \
    && echo "post_max_size = 5M" >> /usr/local/etc/php/conf.d/uploads.ini \
    && echo "memory_limit = 256M" >> /usr/local/etc/php/conf.d/uploads.ini

USER laravel

CMD ["/usr/local/bin/php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]