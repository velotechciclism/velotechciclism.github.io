# Backend VeloTech

API opcional em Express, TypeScript, Prisma e SQLite. Ela não é executada pelo GitHub Pages e precisa de hospedagem Node separada.

## Executar

```bash
cp .env.example .env
npm ci
npm run prisma:generate
npm run db:push
npm run dev
```

Por padrão, a API responde em `http://localhost:3001/api`.

## Variáveis

```env
DATABASE_URL="file:./dev.db"
PORT=3001
NODE_ENV=development
JWT_SECRET=gere_um_segredo_longo_e_aleatorio
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000,http://localhost:4173
```

Use um volume persistente e uma única instância quando publicar com SQLite. Em caminhos locais com caracteres especiais, prefira um `DATABASE_URL` SQLite absoluto com caminho ASCII.

## Rotas

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/products` e `GET /api/products/:id`
- `GET/POST/PATCH/DELETE /api/cart/...`
- `POST /api/cart/checkout`
- `GET /api/orders/me`
- `POST /api/chatbot`
- `POST /api/contact/messages`
- `POST /api/newsletter/subscribe`

Rotas privadas exigem `Authorization: Bearer <token>`.

## Verificar

```bash
npm run prisma:generate
npm run typecheck
npm run build
npm audit --omit=dev
```

O catálogo é semeado na inicialização. O checkout usa transação, valida estoque, cria pedido/pagamento/histórico, reduz o inventário e limpa o carrinho.

Consulte `../docs/auditoria-completa-2026-06-30.md` para resultados de integração e limites de produção.
