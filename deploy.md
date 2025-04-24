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
      - laravel