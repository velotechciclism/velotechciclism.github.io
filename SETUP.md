# 🚀 Guia Rápido - Iniciar o VeloTech Completo

## ⚠️ IMPORTANTE: O Backend Precisa Estar Rodando!

Se você está recebendo o erro **"Failed to fetch"**, é porque o backend não está rodando.

---

## 🗄️ Passo 1: Configurar PostgreSQL

### Opção 1: Usando Docker (Recomendado)

```bash
# Criar container PostgreSQL
docker run --name velotech-db \
  -e POSTGRES_DB=velotech \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:16
```

### Opção 2: PostgreSQL Local

```bash
# Criar banco de dados
createdb velotech

# Ou via psql
psql -U postgres -c "CREATE DATABASE velotech;"
```

---

## 🔧 Passo 2: Iniciar o Backend

### Terminal 1: Backend

```bash
cd server
npm install
npm run db:migrate
npm run dev
```

Deve aparecer:
```
🚀 Servidor rodando em http://localhost:3000
```

---

## 🎨 Passo 3: Iniciar o Frontend

### Terminal 2: Frontend

```bash
npm install
npm run dev
```

Deve aparecer:
```
➜  Local:   http://localhost:5173
```

---

## ✅ Checklist de Funcionamento

- [ ] Backend rodando em `http://localhost:3000` ✓
- [ ] Frontend rodando em `http://localhost:5173` ✓
- [ ] Clique no ícone de usuário → página de cadastro abre
- [ ] Tente se registrar com um email e senha
- [ ] Tente fazer login

---

## 🐛 Troubleshooting

### Erro: "Failed to fetch"
**Causa:** Backend não está rodando
```bash
# Solução:
cd server
npm run dev
```

### Erro: "database does not exist"
**Causa:** PostgreSQL não iniciado ou banco não criado
```bash
# Solução:
docker start velotech-db  # Se usar Docker
# Ou
createdb velotech
```

### Erro: "Connection refused on port 5432"
**Causa:** PostgreSQL não está rodando
```bash
# Solução (Docker):
docker start velotech-db

# Solução (Local):
sudo systemctl start postgresql  # Linux
brew services start postgresql  # macOS
```

### Erro: "EADDRINUSE: address already in use :::3000"
**Causa:** Porta 3000 já está em uso
```bash
# Solução:
# Mude a porta em server/.env
PORT=3001

# Ou encontre e mate o processo
lsof -ti:3000 | xargs kill -9
```

---

## 📱 Testar a Autenticação

### 1. Registrar novo usuário
```
Email: teste@example.com
Nome: João Silva
Senha: senha123
```

### 2. Após registrar, você receberá um token
- Token é armazenado no `localStorage`
- Você será redirecionado automaticamente

### 3. Login
```
Email: teste@example.com
Senha: senha123
```

---

## 🔒 Variáveis de Ambiente

### Frontend (`.env.local`)
```env
VITE_API_URL=http://localhost:3000/api
```

### Backend (`server/.env`)
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/velotech
PORT=3000
JWT_SECRET=seu_secret_seguro_aqui
```

---

## 📊 Estrutura de Pastas

```
velotechbikeyourself/
├── src/                    # Frontend (React + TypeScript)
│   ├── pages/Auth.tsx      # Página de autenticação
│   ├── context/            # Context da autenticação
│   ├── hooks/              # Hooks customizados
│   └── lib/auth.ts         # Funções da API
│
└── server/                 # Backend (Node.js + Express)
    ├── src/
    │   ├── db/             # Conexão e migrations
    │   ├── routes/         # Rotas de autenticação
    │   └── server.ts       # Servidor Express
    └── .env                # Variáveis de ambiente
```

---

## 🎉 Pronto!

Agora seu VeloTech está completo com:
- ✅ Frontend em React
- ✅ Backend em Node.js/Express
- ✅ Banco de dados PostgreSQL
- ✅ Autenticação com JWT
- ✅ Sistema de cadastro e login
