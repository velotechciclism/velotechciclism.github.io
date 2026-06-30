# Auditoria completa VeloTech

Data: 30/06/2026

## Resumo executivo

O site publicado em `https://velotechciclism.github.io/` responde normalmente, e o remoto Git está acessível. O endpoint `https://velotechciclism.github.io/api/health` retorna 404 porque GitHub Pages serve somente arquivos estáticos: ele não executa Node, Prisma nem um processo SQLite de servidor.

A solução adotada separa dois modos válidos:

1. **GitHub Pages/local-first:** SQLite compilado em WebAssembly (`sql.js`), com o arquivo do banco exportado para IndexedDB. Funciona sem API e sem servidor.
2. **Backend remoto:** Express + Prisma + SQLite, ativado somente quando `VITE_API_URL` aponta para um servidor publicado.

O primeiro modo é adequado para demonstração, PWA e uso offline em um único navegador. Não oferece autenticação real compartilhada, sincronização entre aparelhos, recuperação de senha, pagamento real ou atendimento remoto. Esses recursos exigem um backend publicado.

## Validações executadas

- conexão SSH com o remoto Git e leitura das branches: OK;
- site do GitHub Pages por HTTPS: HTTP 200;
- API no domínio do Pages: HTTP 404, comportamento esperado;
- typecheck frontend e backend: OK;
- lint frontend: 0 erros e 12 avisos preexistentes de Fast Refresh;
- build de produção para Pages: OK;
- auditoria npm de dependências de produção, frontend e backend: 0 vulnerabilidades;
- Prisma schema validate/generate: OK;
- integração do backend: health, registro, perfil, catálogo, carrinho, chatbot, checkout, pedidos, contato e newsletter: OK;
- CORS de origem não autorizada: bloqueado;
- carregamento real em Chrome headless, incluindo WebAssembly e IndexedDB: OK.

## Persistência no GitHub Pages

O banco local é inicializado em `src/lib/browserDatabase.ts`. O schema cobre:

- usuários locais e hashes de senha;
- itens do carrinho;
- pedidos e itens;
- favoritos;
- avaliações;
- contatos e newsletter locais;
- mensagens e histórico do chatbot;
- metadados e versão do schema.

O arquivo `public/sqlite/sql-wasm.wasm` é publicado junto do site e incluído no cache da PWA. Dados antigos de usuário, carrinho, pedido, favorito e avaliação guardados em `localStorage` são importados uma vez para o SQLite.

Tokens de sessão, tema e idioma continuam em Web Storage, pois são preferências/sessão do navegador e não dados relacionais.

## Login e segurança

### Modo Pages

- senha derivada com PBKDF2-SHA256, salt aleatório e 310.000 iterações;
- banco persistido no navegador;
- aviso visível informa que a conta não sincroniza;
- qualquer pessoa com controle do navegador pode inspecionar ou apagar os dados: não tratar como conta de produção.

### Modo backend

- senha com bcrypt;
- JWT obrigatório nas rotas privadas;
- validação e normalização de e-mail;
- limites de tamanho para senha, nome, endereço e corpo HTTP;
- rate limit específico para autenticação e chatbot;
- CORS por allowlist;
- Helmet e mensagens genéricas para erros internos;
- `lastLoginAt` atualizado no login.

Risco restante: o frontend guarda JWT em `localStorage`. Para uma operação comercial real, recomenda-se trocar para cookie `HttpOnly`, `Secure`, `SameSite`, com refresh token rotativo e proteção CSRF.

## Carrinho, pedidos e favoritos

- limite de cinco unidades por produto validado no front e no backend;
- carrinho local usa transações SQLite;
- checkout local gera pedido e itens normalizados;
- checkout remoto usa transação Prisma, confere estoque, reduz inventário e limpa carrinho;
- favoritos e reviews deixaram de depender de JSON em `localStorage`;
- histórico local e remoto usa a mesma forma de dados na interface.

O checkout local é uma simulação: não captura pagamento nem reserva estoque compartilhado.

## Chatbot sem API

O assistente local usa busca lexical sobre todo o catálogo, expansão de sinônimos, correção de erros comuns, memória das mensagens recentes, filtro de orçamento e ranking por categoria, estoque e destaque. Foram incluídas respostas especializadas para:

- recomendação e comparação de produtos;
- tamanho de quadro e vestuário;
- manutenção preventiva;
- segurança e visibilidade;
- frete, pagamento, devolução e suporte.

As conversas são gravadas no SQLite local. O assistente não usa modelo generativo nem envia dados a terceiros; por isso é previsível e barato, mas não substitui um LLM para perguntas abertas.

## Gargalos e correções

- bundle único de aproximadamente 656 kB: rotas e chatbot passaram a carregar sob demanda; o bundle inicial caiu para aproximadamente 388 kB;
- SQLite ficou em chunk separado, e o binário WASM tem aproximadamente 645 kB;
- vídeo principal de aproximadamente 6,6 MB continua sendo o maior ativo e merece versões WebM/MP4 responsivas e poster otimizado;
- o service worker passou a armazenar o WASM e teve a versão de cache atualizada;
- metadados sociais externos do gerador original foram removidos;
- chamadas inúteis a `/api` no GitHub Pages foram eliminadas;
- dependências vulneráveis do React Router e Express foram atualizadas.

## Deploy e operação

O workflow de Pages executa lint, typecheck, auditoria de dependências e build. Ele compila o backend apenas como validação; não o hospeda. Para ativar o modo remoto:

1. publicar `server/` em um host Node com volume persistente;
2. definir `DATABASE_URL`, `JWT_SECRET`, `CLIENT_URL` e demais variáveis;
3. definir a variável `VITE_API_URL` do repositório para a URL HTTPS da API;
4. redeployar o Pages.

SQLite de servidor exige uma única instância e disco persistente. Para múltiplas instâncias ou maior concorrência, migrar o datasource Prisma para PostgreSQL.

## Observação do ambiente local

O motor nativo do Prisma não conseguiu criar um caminho SQLite relativo dentro deste diretório de trabalho, cujo nome contém `Área`. O mesmo schema e o backend funcionaram com um caminho SQLite ASCII absoluto em `/tmp`. Isso é uma limitação local do motor/caminho, não do schema nem do Pages. Em CI/Linux, use caminho de projeto sem caracteres especiais ou `DATABASE_URL` absoluto.

## Pendências não bloqueantes

- adicionar testes automatizados de interface ao workflow;
- converter o vídeo hero e otimizar o logo de 220 kB;
- separar exports auxiliares dos componentes para remover 12 avisos de Fast Refresh;
- publicar um backend se login multi-dispositivo, estoque global ou envio real de formulários forem requisitos;
- usar PostgreSQL e um provedor de pagamentos antes de qualquer uso comercial.
