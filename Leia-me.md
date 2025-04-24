https://www.heondokim.com/articles/laravel-websockets-nginx-docker


# docker-compose-laravel
docker system prune -a --volumes apagar todos os containers e volumes

Um fluxo de trabalho Docker Compose bastante simplificado que configura uma rede LEMP de containers para o desenvolvimento local de Laravel.

## Uso

Para começar, certifique-se de ter o [Docker instalado](https://docs.docker.com/docker-for-mac/install/) no seu sistema e, em seguida, clone este repositório.

Depois, navegue até o diretório clonado no seu terminal e inicie os containers do servidor web executando:

```sh
docker-compose up -d --build app
```
docker-compose run --rm  artisan config:publish cors 
docker-compose run --rm composer create-project laravel/laravel .
docker-compose run --rm npm run dev

```

Após a conclusão, siga as etapas do arquivo [src/README.md](src/README.md) para adicionar seu projeto Laravel (ou criar um novo em branco).

**Nota**: O nome do host do banco de dados MySQL deve ser `mysql`, **não** `localhost`. O nome de usuário e o banco de dados devem ser `homestead`, com a senha `secret`.

Levantar a rede do Docker Compose com `app` em vez de apenas `up` garante que apenas os containers do site sejam iniciados, em vez de todos os containers de comando também. A seguir estão os serviços configurados para o servidor web, com suas respectivas portas expostas:

- **nginx** - `:80`
- **mysql** - `:3306`
- **php** - `:9000`
- **redis** - `:6379`
- **mailhog** - `:8025`

Três containers adicionais são incluídos para lidar com os comandos do Composer, NPM e Artisan *sem* a necessidade de instalar essas plataformas no seu computador local. Utilize os seguintes exemplos de comando no diretório raiz do seu projeto, ajustando conforme necessário:

- `docker-compose run --rm composer update`
- `docker-compose run --rm npm run dev`
- `docker-compose run --rm artisan migrate`


## Problemas de Permissões

Se encontrar problemas de permissão no sistema de arquivos ao acessar sua aplicação ou executar comandos no container, tente uma das soluções abaixo.

**Se estiver usando seu servidor ou ambiente local como usuário root:**

1. Derrube os containers com `docker-compose down`
2. Substitua qualquer instância de `php.dockerfile` no arquivo `docker-compose.yml` por `php.root.dockerfile`
3. Reconstrua os containers executando `docker-compose build --no-cache`

**Se estiver usando seu servidor ou ambiente local como um usuário que não é root:**

1. Derrube os containers com `docker-compose down`
2. No terminal, execute `export UID=$(id -u)` e `export GID=$(id -g)`
3. Se aparecerem erros sobre variáveis somente leitura, ignore-os e continue
4. Reconstrua os containers executando `docker-compose build --no-cache`

Depois, levante novamente a rede de containers ou reexecute o comando que tentou anteriormente para verificar se o problema foi resolvido.

## Armazenamento Persistente do MySQL

Por padrão, sempre que você derrubar a rede do Docker, os dados do MySQL serão removidos após a destruição dos containers. Se desejar manter os dados mesmo ao reiniciar os containers, siga estes passos:

1. Crie uma pasta `mysql` no diretório raiz do projeto, ao lado das pastas `nginx` e `src`.
2. No serviço MySQL dentro do seu arquivo `docker-compose.yml`, adicione as seguintes linhas:

```yaml
volumes:
  - ./mysql:/var/lib/mysql
```

## Uso em Produção

Embora este template tenha sido originalmente criado para desenvolvimento local, ele é robusto o suficiente para ser usado em implantações básicas de aplicações Laravel. A principal recomendação é garantir que o HTTPS esteja ativado, fazendo alterações no arquivo `nginx/default.conf` e utilizando algo como o [Let's Encrypt](https://hub.docker.com/r/linuxserver/letsencrypt) para gerar um certificado SSL.

## Compilação de Assets

Esta configuração é compatível com a compilação de assets tanto com o [Laravel Mix](https://laravel-mix.com/) quanto com o [Vite](https://vitejs.dev/). Para começar, adicione ` --host 0.0.0.0` ao final do comando relevante no `package.json`. Por exemplo, em um projeto Laravel usando Vite, o arquivo deve conter:

```json
"scripts": {
  "dev": "vite --host 0.0.0.0",
  "build": "vite build"
},
```

Depois, execute os seguintes comandos para instalar as dependências e iniciar o servidor de desenvolvimento:

- `docker-compose run --rm npm install`
- `docker-compose run --rm --service-ports npm run dev`

Após isso, você poderá usar as diretivas `@vite` para ativar o recarregamento automático de módulos na sua aplicação Laravel local.

Quer compilar para produção? Basta executar:

```sh
docker-compose run --rm npm run build
```

## MailHog

A versão atual do Laravel (9 até o momento) usa o MailHog como a aplicação padrão para testar o envio de e-mails e trabalhos gerais com SMTP durante o desenvolvimento local. Usando a imagem do Docker Hub fornecida, configurar uma instância é simples e direto. O serviço já está incluído no arquivo `docker-compose.yml` e é iniciado junto com os serviços do servidor web e do banco de dados.

Para visualizar o painel e conferir os e-mails enviados, acesse [localhost:8025](http://localhost:8025) após executar:

```sh
docker-compose up -d site
```

