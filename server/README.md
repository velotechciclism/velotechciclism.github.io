# 🚀 VeloTech Backend - Setup e Integração com PostgreSQL

## 📋 Pré-requisitos

- Node.js (v18+)
- PostgreSQL (v12+) instalado e rodando
- npm ou bun

## 🗂️ Estrutura do Projeto

```
server/
├── src/
│   ├── db/
│   │   ├── connection.ts       # Conexão com PostgreSQL
│   │   └── migrate.ts          # Migrações do banco
│   ├── middleware/
│   │   └── auth.ts             # Middleware de autenticação JWT
│   ├── routes/
│   │   ├── auth.ts             # Lógica de autenticação
│   │   └── authRoutes.ts       # Rotas de autenticação
│   └── server.ts               # Servidor Express
├── .env.example                # Variáveis de exemplo
├── package.json
└── tsconfig.json
```

## 🔧 Instalação e Setup

### 1️⃣ Instalar Dependências

```bash
cd server
npm install
```

### 2️⃣ Criar Arquivo .env

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais do PostgreSQL:

```env
DATABASE_URL=postgresql://postgres:sua_senha@localhost:5432/velotech
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=velotech
DATABASE_USER=postgres
DATABASE_PASSWORD=sua_senha

PORT=3000
NODE_ENV=development

JWT_SECRET=seu_secret_super_seguro_aqui
JWT_EXPIRES_IN=7d

CLIENT_URL=http://localhost:5173
```

### 3️⃣ Criar Banco de Dados PostgreSQL

```bash
# Conectar ao PostgreSQL
psql -U postgres

# Criar banco de dados
CREATE DATABASE velotech;

# Sair
\q
```

### 4️⃣ Executar Migrações

```bash
npm run db:migrate
```

## 🚀 Executar o Servidor

### Modo Desenvolvimento (com hot reload)

```bash
npm run dev
```

O servidor rodará em `http://localhost:3000`

### Modo Produção

```bash
npm run build
npm run start
```

## 📡 Endpoints da API

### Registro
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "João Silva",
  "password": "senha123",
  "phone": "11999999999",
  "address": "Rua teste, 123"
}

Response:
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "João Silva",
    "phone": "11999999999",
    "address": "Rua teste, 123",
    "created_at": "2026-01-15T10:30:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "senha123"
}

Response:
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "João Silva",
    "created_at": "2026-01-15T10:30:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Obter Perfil
```
GET /api/auth/me
Authorization: Bearer <token>

Response:
{
  "id": 1,
  "email": "user@example.com",
  "name": "João Silva",
  "phone": "11999999999",
  "address": "Rua teste, 123",
  "created_at": "2026-01-15T10:30:00Z"
}
```

### Health Check
```
GET /api/health

Response:
{
  "status": "OK",
  "message": "VeloTech server is running"
}
```

## 🔐 Autenticação

A API usa JWT (JSON Web Tokens) para autenticação. Após fazer login ou registrar, você receberá um token que deve ser enviado no header:

```
Authorization: Bearer <seu_token>
```

O token expira em 7 dias por padrão (configurável em `.env`).

## 🗄️ Estrutura do Banco de Dados

### Tabela de Usuários

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address VARCHAR(255),
  city VARCHAR(100),
  zipcode VARCHAR(10),
  country VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🐛 Troubleshooting

### Erro: "connect ECONNREFUSED"
- Verifique se PostgreSQL está rodando
- Verifique as credenciais em `.env`

### Erro: "database does not exist"
- Execute: `createdb velotech`
- Ou crie via pgAdmin/psql

### Erro: "Token inválido"
- Verifique se o JWT_SECRET em `.env` está correto
- Regenere o token fazendo login novamente

## 📚 Documentação Adicional

- [Express.js](https://expressjs.com/)
- [PostgreSQL](https://www.postgresql.org/docs/)
- [JWT](https://jwt.io/)
- [bcryptjs](https://github.com/dcodeIO/bcrypt.js)

## 🔮 Próximos Passos

- [ ] Validação de email
- [ ] Recuperação de senha
- [ ] Autenticação com Google/GitHub
- [ ] Rate limiting
- [ ] Logs melhorados
- [ ] Testes automatizados
