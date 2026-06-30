# Executar o VeloTech

## Modo estático, igual ao GitHub Pages

Este modo não requer backend. Login de demonstração, carrinho, pedidos, favoritos, avaliações e chatbot são persistidos em SQLite WebAssembly dentro do navegador.

```bash
npm ci
npm run dev
```

Acesse `http://localhost:3000`. Para validar exatamente o build publicado:

```bash
npm run build:gh
npm run preview
```

Os dados locais ficam somente no perfil do navegador e não sincronizam entre aparelhos.

## Modo com backend

O backend é opcional e usa Express, Prisma e SQLite.

```bash
npm --prefix server ci
npm --prefix server run prisma:generate
npm --prefix server run db:push
npm --prefix server run dev
```

Em outro terminal:

```bash
VITE_API_URL=http://localhost:3001/api npm run dev
```

Variáveis do backend em `server/.env`:

```env
DATABASE_URL=file:./dev.db
PORT=3001
NODE_ENV=development
JWT_SECRET=troque-por-um-segredo-longo-e-aleatorio
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000,http://localhost:4173
```

Use um caminho absoluto ASCII para `DATABASE_URL` se o motor do Prisma tiver dificuldade com caracteres especiais no caminho do projeto.

## Verificações

```bash
npm run typecheck
npm run lint
npm audit --omit=dev
npm run build:gh

npm --prefix server run prisma:generate
npm --prefix server run typecheck
npm --prefix server run build
npm --prefix server audit --omit=dev
```

## GitHub Pages

O workflow `.github/workflows/deploy-pages.yml` publica somente `dist/`. GitHub Pages não executa o diretório `server/`.

Sem `VITE_API_URL`, o site usa automaticamente SQLite no navegador. Para recursos compartilhados, publique o backend separadamente e configure a variável de repositório `VITE_API_URL` com a URL HTTPS terminada em `/api`.

Consulte `docs/auditoria-completa-2026-06-30.md` para limites de segurança, resultados dos testes e recomendações de produção.
