# Auditoria completa VeloTech

Data: 30/06/2026

## Revalidacao operacional - 30/06/2026 17:14 America/Bahia

Esta revalidacao foi executada no workspace local em `/home/gabriel/Área de trabalho/Velotech/velotechciclism.github.io`.

Resultado atualizado:

- remoto Git `git@github.com:velotechciclism/velotechciclism.github.io.git`: acessivel via SSH;
- branch atual: `master`;
- `npm run typecheck`: OK;
- `npm run lint`: OK, com 12 avisos preexistentes de Fast Refresh e 0 erros;
- `npm audit --omit=dev`: 0 vulnerabilidades;
- `npm --prefix server run typecheck`: OK;
- `npm --prefix server audit --omit=dev`: 0 vulnerabilidades;
- `DATABASE_URL='file:/tmp/velotech-audit.db' npx prisma validate`: OK;
- `npm --prefix server run prisma:generate`: OK;
- `npm --prefix server run build`: OK;
- `DATABASE_URL='file:/tmp/velotech-audit.db' npx prisma db push`: falhou neste ambiente com `Schema engine error` sem detalhe;
- `npm run build:gh`: OK;
- `vite preview` local em `http://127.0.0.1:4173/`: OK;
- `http://127.0.0.1:4173/sqlite/sql-wasm.wasm`: HTTP 200, `Content-Type: application/wasm`, 659730 bytes;
- Chrome headless carregando o build local: OK, sem erro de inicializacao da aplicacao;
- site publicado `https://velotechciclism.github.io/`: HTTP 200;
- `https://velotechciclism.github.io/sqlite/sql-wasm.wasm`: HTTP 404 no deploy remoto atual;
- `https://velotechciclism.github.io/api/health`: HTTP 404, esperado para GitHub Pages.

Conclusao da revalidacao: o build local atual esta pronto para GitHub Pages e inclui o SQLite WebAssembly necessario. O deploy remoto publicado em `https://velotechciclism.github.io/` ainda parece ser uma versao antiga, pois nao contem `sqlite/sql-wasm.wasm`. Para garantir o funcionamento real no GitHub Pages, publique o build atual via workflow `Deploy GitHub Pages` ou `npm run deploy:gh`.

Observacao de backend nesta revalidacao: o backend compilou e o schema Prisma validou, mas os endpoints HTTP nao foram reexecutados porque `prisma db push` falhou no engine local antes de criar o banco temporario. Isso nao afeta o modo GitHub Pages, que usa SQLite no navegador via `sql.js`, mas bloqueia a prova local end-to-end do backend Express neste computador.

## Implementacao adicional - 30/06/2026 17:26 America/Bahia

Foram implementadas funcionalidades visiveis no modo GitHub Pages/local-first:

- rota `/admin` com painel administrativo para usuários com `role = admin`;
- contas `nunesnbnxn@gmail.com` e `c.eduardoteixeiraguinsber@gmail.com` promovidas automaticamente a administradoras no SQLite local;
- gestão local de usuários com promoção/remocao de admin e bloqueio/desbloqueio;
- gestão local de produtos com stock total, stock disponivel, limite `maxPerUser` e ocultacao;
- cartões e detalhe de produto exibem stock e limite por usuário;
- carrinho valida produto sem stock, stock disponivel e limite especifico por produto;
- avaliacoes ganharam campo `status` para moderação administrativa;
- chatbot local passou a usar o catálogo mesclado com stock/visibilidade definidos pelo admin;
- aba administrativa `Dados` adicionada para visualizar usuários, carrinhos, pedidos, favoritos, avaliações, contatos, newsletter, chats e overrides de produtos;
- exportação administrativa adicionada em JSON e SQLite local (`.sqlite`);
- aviso visual de modo local removido da tela de login/cadastro;
- roteiro didático criado em `docs/roteiro-video-novos-ajustes.md`;
- prints de validação foram salvos em `screenshots/`.

## Melhoria do chatbot local - 30/06/2026

O chatbot local foi reforçado para atuar mais como consultor de compra:

- vocabulário expandido para bicicletas, acessórios, roupas, usos, níveis, tamanhos, cores, pagamento, stock, frete e intenção de compra;
- correção simples de erros comuns de digitação;
- criação de um perfil da necessidade do cliente com orçamento, categoria, uso, prioridade, marca, tamanho, cor e urgência;
- ranqueamento de produtos por aderência semântica, orçamento, stock, categoria, uso e intenção;
- respostas com motivos de recomendação e orientação para abrir o produto e seguir para o carrinho;
- atalhos visuais no widget para consultas frequentes como "bike para trilha até 300" e "luvas baratas em stock";
- uso do catálogo administrável, respeitando produtos ocultos e stock local.

## Fechamento do plano funcional - 01/07/2026

Foram adicionados os pontos que ainda estavam parciais no modo GitHub Pages/local-first:

- criação de produtos pelo administrador com nome, descrição, categoria, marca, preço, imagem, stock e `maxPerUser`;
- edição completa dos produtos, incluindo preço, descrição e imagem;
- desativação/ocultação de produtos pela administração;
- gestão local de categorias e marcas;
- histórico de alterações de stock em `stock_history`;
- registro de atividade local em `user_activity_events`, incluindo visualização de produto, carrinho e checkout;
- dashboard com produtos mais visualizados;
- relatórios simples de inventário e atividade;
- checkout com seleção visual dos métodos do plano: Visa, Mastercard, PayPal, MB Way, Apple Pay e Google Pay.

Arquivos de evidência visual:

- `screenshots/01-produtos-stock-limite.png`;
- `screenshots/02-painel-admin.png`;
- `screenshots/03-admin-stock-editado.png`.
- `public/screenshots/04-deploy-produtos-github-pages.png`, publicado em `/screenshots/04-deploy-produtos-github-pages.png`.

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
