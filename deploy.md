sudo apt-get update
sudo apt-get install git

2- add usuario nao root com previlégios sudo
3 - sudo adduser docker e digitar senha
4 - sudo usermod -aG sudo docker // para dar privilégios de sudo
5 - sudo apt install apt-transport-https ca-certificates curl software-properties-common // para adicionar o repositório do docker 

6 - baixar a chave gpg do docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

7 - sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable"    // adicionar o repositório do docker

8 - sudo apt update

9 - apt-cache policy docker-ce // para verificar a versão do docker, ja esta instalado o pacote

10 - sudo apt install docker-ce

### 11 - permitiremos que o user nao root use o container sem sudo 

12 - sudo usermod -aG docker ${USER} e sudo usermod -aG docker docker
12 - su docker, depois de entrar pra ver o estado
sudo systemctl status docker

12.1 -
Esse comando está dizendo que o usuário atual (edmar, no exemplo) pertence aos grupos:
docker → ✅ pode usar Docker sem sudo

sudo → ✅ pode executar comandos com privilégios elevados

users → grupo padrão de usuários comuns

id -nG

13 - sudo apt install docker-compose
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

13.1 - 
sudo chmod +x /usr/local/bin/docker-compose

docker-compose -v

14 - docker e docker-compose instalados

15 - vamos a directory do user docker

cd ~  //em 5min

16- criar uma pasta site mkdir site e repo/site.git, depois de criar o repo,  cd repo mkdir site.git

17 - cd site.git execute git init --bare // para criar um repositório bare 
:/repo/site.git$ sudo git init --bare

17.1 cd hooks

18 - criar nano post-receive
criar um script que roda mudança no repositório

#!/bin/sh

-- 1. aponta aonde os arquivos do site ficarao, 2. git dir igual ao repositório inicializado com um repositório git vazio

git --work-tree=/home/docker/site --git-dir=/home/docker/repo/site.git checkout -f main

salva e sai rodo para tornar o script executavel

19 - docker@Ubuntu-Server0:/repo/site.git/hooks$ 

sudo chmod +x post-receive

20 - exit 2x para ir ao ambiente local ja do projecto fora do server

21 - 
git init

22 - 
git remote add origin ssh://docker@192.168.0.121/home/docker/repo/site.git

git add .

23 - add mysql mas ao os arquivos 

23 / git rm -r --cached mysql/* no git ignore nao pode ter a pasta se nao a versiona
git rm -r --cached mysql


24 - git add .

25 - git commit -m "initial"

26 - renomeiar o branch master para main

27 - git branch -M main
git push origin main
sudo chown -R docker:docker /home/docker/repo/site.git
sudo chmod -R 775 /home/docker/repo/site.git
sudo chown -R docker:docker /home/docker/site

copiar a config ssh do root para o docker

austin
28 - sudo rsync --archive --chown=docker:docker ~/.ssh /home/docker

29 agora ro de novo git push origin main

30 -entro em docker@Ubuntu-Server0:~/site$ docker-compose up -d --build app



bugs e solucoes

docker@Ubuntu-Server0:~$ export UID=$(id -u)
-bash: UID: readonly variable
Dito pelo ChatGPT:
No Bash, a variável $UID é uma variável especial e somente leitura, ou seja, você não pode sobrescrevê-la com export UID=$(id -u).

🔹 Solução
Se precisar passar o ID do usuário como argumento no Docker Compose, use outra variável, como USER_ID:


export USER_ID=$(id -u)
export GROUP_ID=$(id -g)
Depois, verifique se foram definidas corretamente:


echo $USER_ID
echo $GROUP_ID

Agora, no docker-compose.yml do server, altere para usar essas novas variáveis:


args:
  - UID=${USER_ID}
  - GID=${GROUP_ID}

2 - 

Solução 2: Corrigir permissões da pasta src
Execute o seguinte comando no seu host para garantir que as permissões estejam corretas:

sudo chown -R 1001:1001 ./src
sudo chmod -R 775 ./src

3 - 
sudo chown -R 1001:1001 ./src
sudo chmod -R 775 ./src

sudo chmod 666 ./src/composer.lock

# Tornar toda a pasta storage gravável
sudo chmod -R 777 ./src/storage

# Tornar bootstrap/cache gravável
sudo chmod -R 777 ./src/bootstrap/cache

4 - sudo docker-compose run --rm composer install

5 - sudo docker-compose run --rm npm install

5.1 sudo nano .env e copiar os dados do .env do projeto local

6 - sudo docker-compose run --rm artisan migrate



7 - sudo docker-compose run --rm npm run build

8 - bug ao instalar api solucao 

# Tornar composer.json gravável
sudo chmod 666 ./src/composer.json

# Tornar toda a pasta routes gravável
sudo chmod -R 777 ./src/routes

# Verificar novamente as permissões de storage (incluindo subdiretórios)
sudo chmod -R 777 ./src/storage


### 2. Dê permissão de execução no host
No terminal, rode:

bash
Copiar
Editar
chmod +x dockerfiles/entrypoint.sh
#### deploy em production  trocar yml prod

nginx.prod.dockerfile
php.prod.dockerfile
docker-compose.prod.yml

docker-compose -f docker-compose.prod.yml up -d --build app

9 - # Instalar dependências npm
docker-compose -f docker-compose.prod.yml run --rm npm install

# Construir assets para produção
docker-compose -f docker-compose.prod.yml run --rm npm run build

# Rodar migrações
docker-compose -f docker-compose.prod.yml run --rm artisan migrate

# Instalar dependências do Composer
docker-compose -f docker-compose.prod.yml run --rm composer install --optimize-autoloader

# Executar testes, se necessário
docker-compose -f docker-compose.prod.yml run --rm pest


reverb:
    build:
      context: ./dockerfiles
      dockerfile: reverb.dockerfile
  
    container_name: reverb
  
    ports:
      - 8080:8080
    volumes:
      - ./src:/var/www/html:delegated
    working_dir: /var/www/html
    networks:
      - 
      

      origin  ssh://docker@192.168.0.121/home/docker/repo/site.git (fetch)
origin  ssh://docker@192.168.0.121/home/docker/repo/site.git (push)







add reverb

Primeiro, verifique seu arquivo de entrada para o Reverb:

#!/bin/sh
set -e

#!/bin/bash

cd /var/www/html

# Ajusta as permissões para o usuário laravel
chown -R laravel:laravel /var/www/html/storage
chmod -R 775 /var/www/html/storage

# Executa o comando como usuário laravel
su laravel -c "cd /var/www/html && php artisan reverb:start --port=8081 --host=0.0.0.0 --debug"

exec "$@"


2. Modifique seu arquivo resources/js/echo.js para configurar o Echo corretamente

import Echo from 'laravel-echo';

import Pusher from 'pusher-js';
window.Pusher = Pusher;

 window.Echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY || 'qqmsdqbnqvuhmij41258',
    wsHost: window.location.hostname || 'reverb',
    wsPort: import.meta.env.VITE_REVERB_PORT ?? 8081,
    wssPort: import.meta.env.VITE_REVERB_PORT ?? 8081,
    forceTLS: false,
   // forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
    enabledTransports: ['ws', 'wss'],
    cluster: 'mt1' // Adicione esta linha
}); 

3 . Corrija o arquivo .env no projeto Laravel:

BROADCAST_CONNECTION=reverb
FILESYSTEM_DISK=local
QUEUE_CONNECTION=database

CACHE_STORE=database
CACHE_PREFIX=

MEMCACHED_HOST=127.0.0.1

REDIS_CLIENT=phpredis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

PUSHER_HOST=soketi
PUSHER_APP_ID=app-id
PUSHER_APP_KEY=app-key
PUSHER_APP_SECRET=app-secret


BROADCAST_DRIVER=pusher

REVERB_APP_ID=573699
REVERB_APP_KEY=qqmsdqbnqvuhmij41258
REVERB_APP_SECRET=fgvldq8bdjsbqqjssdf4564n6
REVERB_SERVER_HOST=reverb
REVERB_SERVER_PORT=8081
REVERB_SCHEME=http


4 - Verifique se o arquivo de configuração de broadcasting está correto:

config/broadcasting.php

'reverb' => [
            'driver' => 'reverb',
            'key' => env('REVERB_APP_KEY'),
            'secret' => env('REVERB_APP_SECRET'),
            'app_id' => env('REVERB_APP_ID'),
            'options' => [
                'host' => env('REVERB_SERVER_HOST', 'reverb'),
                'port' => env('REVERB_SERVER_PORT', 8081),
                'scheme' => env('REVERB_SCHEME', 'http'),
                'encrypted' => false,
            'useTLS' => false,
            ],
],

5 - Importante: Para permitir que seu contêiner Reverb seja acessado corretamente, modifique a configuração do Nginx:

server {
    listen 8081;
    server_name _;

    location / {
        proxy_pass http://reverb:8081;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }
}

6 - Certifique-se que seu arquivo vite.config.js está configurado para expor as variáveis de ambiente do Reverb:

import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/sass/app.scss',
                'resources/js/app.js',
            ],
            refresh: [
                'resources/routes/**',
                'routes/**',
                'resources/views/**',
            ],
        }),
    ],
    server: {
        hmr: {
            host: 'localhost',
        },
    },
});


7 - Adicione esses logs de depuração que podem ajudar a identificar a causa raiz do problema:
Atualize o arquivo chat.blade.php para usar o Echo corretamente:



<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chat em Tempo Real</title>
    <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/laravel-echo/1.19.0/echo.iife.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/pusher-js@8.4.0/dist/web/pusher.min.js"></script>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            padding: 20px;
        }
        .messages {
            height: 400px;
            overflow-y: auto;
            border: 1px solid #e1e1e1;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 4px;
        }
        .message {
            margin-bottom: 10px;
            padding: 8px 12px;
            background-color: #f0f0f0;
            border-radius: 4px;
        }
        .message .user {
            font-weight: bold;
            color: #2c3e50;
        }
        form {
            display: flex;
            flex-direction: column;
        }
        .input-group {
            margin-bottom: 10px;
        }
        input, button {
            padding: 10px;
            border-radius: 4px;
            border: 1px solid #ddd;
        }
        button {
            background-color: #4CAF50;
            color: white;
            border: none;
            cursor: pointer;
            transition: background-color 0.3s;
        }
        button:hover {
            background-color: #45a049;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .messages {
            border: 1px solid #ddd;
            padding: 15px;
            height: 300px;
            overflow-y: auto;
            margin-bottom: 20px;
        }
        .message {
            margin-bottom: 10px;
        }
        .user {
            font-weight: bold;
            color: #3490dc;
        }
        .input-group {
            margin-bottom: 10px;
        }
        input {
            padding: 10px;
            width: 100%;
        }
        button {
            padding: 10px 20px;
            background-color: #3490dc;
            color: white;
            border: none;
            cursor: pointer;
        }
    </style>
    @vite(['resources/js/app.js'])
</head>
<body>
    <div class="container">
        <h1>Chat em Tempo Real</h1>
        
        <div class="messages" id="messages">
            <!-- As mensagens aparecerão aqui -->
        </div>
        
        <form id="message-form">
            <div class="input-group">
                <input type="text" id="username" placeholder="Seu nome" required>
            </div>
            <div class="input-group">
                <input type="text" id="message" placeholder="Digite sua mensagem" required>
            </div>
            <button type="submit">Enviar</button>
        </form>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', function() {

            console.log('DOM carregado');
console.log('Echo está disponível?', typeof window.Echo !== 'undefined');
if (typeof window.Echo !== 'undefined') {
    console.log('Echo configurado com:', {
        broadcaster: window.Echo.connector.options.broadcaster,
        host: window.Echo.connector.options.host,
        port: window.Echo.connector.options.port
    });
}
            // Verifica se o Echo está disponível
            if (typeof Echo === 'undefined') {
                console.error('Echo não está definido. Verifique se o app.js está carregado corretamente.');
                return;
            }

            console.log('Echo inicializado:', Echo);
            
            // Escutar o canal público
            Echo.channel('public-chat')
                .listen('.new-message', (data) => {
                    console.log('Mensagem recebida:', data);
                    addMessage(data.user, data.message);
                });

            // Função para adicionar mensagem à lista
            function addMessage(user, message) {
                const messagesDiv = document.getElementById('messages');
                const messageElement = document.createElement('div');
                messageElement.className = 'message';
                messageElement.innerHTML = `<span class="user">${user}:</span> ${message}`;
                messagesDiv.appendChild(messageElement);
                messagesDiv.scrollTop = messagesDiv.scrollHeight;
            }

            // Manipular envio do formulário
            document.getElementById('message-form').addEventListener('submit', function(e) {
                e.preventDefault();
                
                const username = document.getElementById('username').value;
                const message = document.getElementById('message').value;
                
                if (message.trim() === '') return;
                
                // Enviar mensagem para o servidor
                axios.post('/send-message', {
                    user: username,
                    message: message
                })
                .then(response => {
                    console.log('Mensagem enviada com sucesso:', response.data);
                    document.getElementById('message').value = '';
                })
                .catch(error => {
                    console.error('Erro ao enviar mensagem:', error);
                });
            });
        });
    </script>


</body>
</html>

8 - docker-compose up -d --build app


9 iniciar o docker compose com ubuntu server

1
sudo nano /etc/systemd/system/docker-compose-app.service


[Unit]
Description=Docker Compose Application Service
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/docker/site
ExecStart=/usr/bin/docker-compose up -d app
ExecStop=/usr/bin/docker-compose down

[Install]
WantedBy=multi-user.target

2 - sudo systemctl enable docker-compose-app.service
3 - sudo systemctl start docker-compose-app.service

4 - sudo systemctl status docker-compose-app.service





docker-compose run --rm certbot certonly -d ilinks.duckdns.org


### 1 - permissions
austin@server:/home/docker/site$ sudo chmod +x ./dockerfiles/reverb-entrypoint.sh

sudo chmod +x ./dockerfiles/entrypoint.sh

sudo chmod +x /etc/systemd/system/docker-compose-app.service
