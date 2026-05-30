# Guia Didatico da API VeloTech

## O que e a API

Pense na API como a "central de atendimento interna" do site.

Quando uma pessoa usa o frontend da loja e faz algo como:

- criar conta;
- entrar no sistema;
- abrir um produto;
- adicionar item ao carrinho;
- finalizar uma compra;
- mandar mensagem no chatbot;

o frontend nao resolve isso sozinho. Ele envia um pedido para a API, e a API responde com os dados ou executa a acao.

Em termos simples:

- o frontend e a parte visual que a pessoa usa;
- a API e a parte que recebe pedidos, aplica regras e conversa com o banco de dados;
- o banco guarda as informacoes de forma persistente.

## Como imaginar o fluxo

Um jeito simples de entender:

1. a pessoa clica em algo no site;
2. o frontend monta uma requisicao;
3. a API recebe essa requisicao;
4. a API valida os dados;
5. a API consulta ou grava no banco;
6. a API devolve uma resposta em JSON;
7. o frontend mostra o resultado na tela.

Exemplo:

1. a pessoa faz login;
2. o frontend envia e-mail e senha para a API;
3. a API verifica se o usuario existe;
4. a API compara a senha;
5. se estiver certo, devolve o usuario e um token;
6. o frontend guarda esse token e passa a usar as rotas privadas.

## Onde a API fica no projeto

O backend da API esta principalmente dentro de [`server/`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server).

Arquivos mais importantes:

- [`server/src/server.ts`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/server.ts:1): liga a API e registra as rotas.
- [`server/src/prisma.ts`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/prisma.ts:1): cria a conexao com o banco via Prisma.
- [`server/prisma/schema.prisma`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/prisma/schema.prisma:1): descreve a estrutura do banco.
- [`server/src/routes/`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/routes): contem as rotas da API.
- [`server/src/middleware/`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/middleware): contem regras reaproveitadas, como autenticacao.

## Como a API e configurada

As configuracoes principais ficam em [`server/.env.example`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/.env.example:1).

### `DATABASE_URL`

Diz onde esta o banco de dados.

Hoje o projeto usa SQLite:

```env
DATABASE_URL="file:./dev.db"
```

Traduzindo:

- `file:` indica que o banco e um arquivo;
- `./dev.db` e o arquivo local do banco.

### `PORT`

Define em qual porta a API vai rodar.

Hoje:

```env
PORT=3001
```

Ou seja, localmente a API tende a abrir em `http://localhost:3001`.

### `JWT_SECRET`

E a chave usada para assinar os tokens de login.

Em linguagem simples:

- quando a pessoa entra na conta, a API entrega um token;
- esse token prova que a pessoa ja se autenticou;
- a assinatura serve para impedir falsificacao.

### `JWT_EXPIRES_IN`

Define por quanto tempo o token vale.

Hoje:

```env
JWT_EXPIRES_IN=7d
```

Isso quer dizer 7 dias.

### `CLIENT_URL`

Define qual endereco do frontend esta autorizado a conversar com a API.

Isso faz parte do controle de CORS, que evita que qualquer site aleatorio consiga fazer requisicoes como se fosse a loja.

## Como a API sobe

O arquivo principal e [`server/src/server.ts`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/server.ts:1).

Quando ele roda, faz estas etapas:

1. carrega as variaveis de ambiente com `dotenv`;
2. cria o app Express;
3. aplica protecoes e configuracoes;
4. registra as rotas;
5. prepara o catalogo;
6. abre a porta e passa a aceitar requisicoes.

### Funcoes e blocos importantes de `server.ts`

#### `parseOrigin()`

Referencia: [`server/src/server.ts:26`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/server.ts:26)

Serve para tentar interpretar uma origem, como `http://localhost:5173`, como uma URL valida.

Em termos práticos:

- ajuda a API a entender de onde a requisicao esta vindo;
- participa da validacao de CORS.

#### `isLoopbackHost()`

Referencia: [`server/src/server.ts:34`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/server.ts:34)

Verifica se o endereco e local, como:

- `localhost`
- `127.0.0.1`
- `::1`

Isso facilita o uso no ambiente de desenvolvimento.

#### `isLoopbackOrigin()`

Referencia: [`server/src/server.ts:38`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/server.ts:38)

Serve para reconhecer quando uma origem local deve ser aceita.

Traduzindo:

- se o frontend estiver rodando localmente;
- e a origem bater com a configuracao permitida;
- a API aceita a comunicacao.

#### `apiLimiter`

Referencia: [`server/src/server.ts:57`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/server.ts:57)

E o limitador de requisicoes.

Hoje ele permite:

- ate 300 requisicoes;
- em uma janela de 15 minutos.

Objetivo:

- diminuir abuso;
- proteger a API contra excesso de chamadas.

#### Middlewares principais

Referencia: [`server/src/server.ts:65`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/server.ts:65)

Aqui entram quatro pecas importantes:

- `helmet`: adiciona protecoes em cabecalhos HTTP;
- `express.json()`: permite que a API leia JSON enviado pelo frontend;
- `apiLimiter`: aplica o limite de requisicoes;
- `cors(...)`: controla quais origens podem chamar a API.

#### Registro das rotas

Referencia: [`server/src/server.ts:82`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/server.ts:82)

Aqui a API "encaixa" seus modulos:

- `/api/auth`
- `/api/chatbot`
- `/api/products`
- `/api/cart`
- `/api/orders`
- `/api` para contato, newsletter e eventos

#### Health check

Referencia: [`server/src/server.ts:91`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/server.ts:91)

`GET /api/health` e uma rota simples para confirmar se o servico esta de pe.

Serve para responder algo como:

- "a API esta viva?"
- "o servidor esta no ar?"

#### Middleware global de erro

Referencia: [`server/src/server.ts:95`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/server.ts:95)

Se algo der errado e a rota nao tratar diretamente, esse bloco entra em acao.

Ele transforma o erro em resposta padrao, para que o frontend receba mensagens coerentes.

#### `bootstrap()`

Referencia: [`server/src/server.ts:119`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/server.ts:119)

E a funcao que realmente inicializa a API.

Ela faz duas coisas principais:

1. chama `ensureCatalogSeeded()`;
2. abre o servidor na porta escolhida.

## Como a API conversa com o banco

Arquivo: [`server/src/prisma.ts`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/prisma.ts:1)

Esse arquivo tem uma responsabilidade simples:

- criar uma instancia do `PrismaClient`;
- exportar essa instancia para o resto do backend.

Pense assim:

- o Prisma e o "tradutor" entre o codigo e o banco;
- em vez de escrever SQL manual o tempo todo, o codigo usa metodos como `findMany`, `create`, `update`, `upsert`.

## Como o banco esta organizado

Arquivo: [`server/prisma/schema.prisma`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/prisma/schema.prisma:1)

Esse arquivo descreve as "tabelas" do sistema.

### Parte de usuarios

#### `User`

Referencia: [`server/prisma/schema.prisma:10`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/prisma/schema.prisma:10)

Guarda:

- e-mail;
- nome;
- senha;
- telefone;
- endereco;
- status da conta.

### Parte do catalogo

#### `Category`

Referencia: [`server/prisma/schema.prisma:32`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/prisma/schema.prisma:32)

Representa categorias como bicicletas, roupas e acessorios.

#### `Brand`

Referencia: [`server/prisma/schema.prisma:45`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/prisma/schema.prisma:45)

Representa marcas dos produtos.

#### `Product`

Referencia: [`server/prisma/schema.prisma:55`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/prisma/schema.prisma:55)

Representa o produto principal.

Guarda coisas como:

- nome;
- descricao;
- preco;
- categoria;
- marca;
- se esta ativo;
- se e destaque;
- se e novo.

#### `ProductImage`

Referencia: [`server/prisma/schema.prisma:88`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/prisma/schema.prisma:88)

Guarda as imagens do produto.

#### `ProductSpec`

Referencia: [`server/prisma/schema.prisma:100`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/prisma/schema.prisma:100)

Guarda especificacoes, como tamanho, cor ou tipo.

#### `Inventory`

Referencia: [`server/prisma/schema.prisma:112`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/prisma/schema.prisma:112)

Guarda o estoque de cada produto.

### Parte do carrinho e compra

#### `Cart`

Referencia: [`server/prisma/schema.prisma:121`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/prisma/schema.prisma:121)

Representa o carrinho do usuario.

#### `CartItem`

Referencia: [`server/prisma/schema.prisma:131`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/prisma/schema.prisma:131)

Representa cada item dentro do carrinho.

#### `Order`

Referencia: [`server/prisma/schema.prisma:146`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/prisma/schema.prisma:146)

Representa o pedido ja finalizado.

#### `OrderItem`

Referencia: [`server/prisma/schema.prisma:172`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/prisma/schema.prisma:172)

Guarda os itens daquele pedido.

#### `Payment`

Referencia: [`server/prisma/schema.prisma:198`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/prisma/schema.prisma:198)

Guarda dados do pagamento associado ao pedido.

### Parte de contato, newsletter e eventos

#### `ContactMessage`

Referencia: [`server/prisma/schema.prisma:263`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/prisma/schema.prisma:263)

Guarda mensagens enviadas pelo formulario de contato.

#### `NewsletterSubscriber`

Referencia: [`server/prisma/schema.prisma:273`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/prisma/schema.prisma:273)

Guarda quem se inscreveu na newsletter.

#### `UserActivityEvent`

Referencia: [`server/prisma/schema.prisma:281`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/prisma/schema.prisma:281)

Guarda eventos de atividade do sistema.

#### `AuditEvent`

Referencia: [`server/prisma/schema.prisma:295`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/prisma/schema.prisma:295)

Guarda eventos importantes para auditoria.

### Parte do chatbot

#### `ChatConversation`

Referencia: [`server/prisma/schema.prisma:310`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/prisma/schema.prisma:310)

Representa uma conversa.

#### `ChatMessage`

Referencia: [`server/prisma/schema.prisma:319`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/prisma/schema.prisma:319)

Representa cada mensagem dentro da conversa.

## Como a autenticacao funciona

Arquivos principais:

- [`server/src/routes/auth.ts`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/routes/auth.ts:1)
- [`server/src/routes/authRoutes.ts`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/routes/authRoutes.ts:1)
- [`server/src/middleware/auth.ts`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/middleware/auth.ts:1)

### Ideia geral

Quando a pessoa faz login, a API:

1. confere o e-mail e a senha;
2. se estiver tudo certo, cria um token;
3. envia esse token para o frontend;
4. nas proximas chamadas privadas, o frontend manda esse token no cabecalho.

### Arquivo `auth.ts`

#### `registerSchema`

Referencia: [`server/src/routes/auth.ts:7`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/routes/auth.ts:7)

Define quais dados sao aceitos no cadastro.

Serve para impedir entrada incompleta ou invalida.

#### `loginSchema`

Referencia: [`server/src/routes/auth.ts:15`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/routes/auth.ts:15)

Define quais dados sao aceitos no login.

#### `getJwtSecret()`

Referencia: [`server/src/routes/auth.ts:38`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/routes/auth.ts:38)

Busca a chave usada para assinar o token.

#### `registerUser()`

Referencia: [`server/src/routes/auth.ts:49`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/routes/auth.ts:49)

O que essa funcao faz:

1. gera hash da senha;
2. verifica se o e-mail ja existe;
3. cria o usuario no banco;
4. gera um token JWT;
5. devolve usuario + token.

#### `loginUser()`

Referencia: [`server/src/routes/auth.ts:88`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/routes/auth.ts:88)

O que essa funcao faz:

1. procura o usuario pelo e-mail;
2. compara a senha enviada com a senha salva;
3. se bater, cria um novo token;
4. devolve usuario + token.

#### `getUserById()`

Referencia: [`server/src/routes/auth.ts:121`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/routes/auth.ts:121)

Busca os dados do usuario pelo id, sem devolver a senha.

### Arquivo `authRoutes.ts`

#### `POST /register`

Referencia: [`server/src/routes/authRoutes.ts:9`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/routes/authRoutes.ts:9)

Recebe o cadastro e chama `registerUser()`.

#### `POST /login`

Referencia: [`server/src/routes/authRoutes.ts:24`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/routes/authRoutes.ts:24)

Recebe login e senha e chama `loginUser()`.

#### `GET /me`

Referencia: [`server/src/routes/authRoutes.ts:39`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/routes/authRoutes.ts:39)

Serve para o frontend perguntar:

- "quem e o usuario que esta autenticado agora?"

### Arquivo `middleware/auth.ts`

#### `AuthRequest`

Referencia: [`server/src/middleware/auth.ts:4`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/middleware/auth.ts:4)

E uma extensao da requisicao para permitir guardar `userId` e `userEmail`.

#### `getJwtSecret()`

Referencia: [`server/src/middleware/auth.ts:9`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/middleware/auth.ts:9)

Busca o segredo do token.

#### `authMiddleware()`

Referencia: [`server/src/middleware/auth.ts:19`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/middleware/auth.ts:19)

Essa funcao protege rotas privadas.

Ela faz:

1. le o cabecalho `Authorization`;
2. verifica se existe `Bearer token`;
3. valida a assinatura;
4. se estiver tudo certo, coloca o usuario dentro da requisicao;
5. deixa a rota continuar.

## Como os produtos funcionam

Arquivo: [`server/src/routes/productsRoutes.ts`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/routes/productsRoutes.ts:1)

Esse modulo responde a perguntas como:

- "quais produtos existem?"
- "quais categorias existem?"
- "me mostre um produto especifico"

### `GET /products/meta`

Referencia: [`server/src/routes/productsRoutes.ts:7`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/routes/productsRoutes.ts:7)

Retorna dados de apoio para filtros.

Exemplo de uso:

- preencher select de categoria;
- preencher lista de marcas.

### `GET /products`

Referencia: [`server/src/routes/productsRoutes.ts:28`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/routes/productsRoutes.ts:28)

Essa rota lista os produtos.

Ela aceita filtros como:

- texto de busca;
- categoria;
- marca;
- faixa de preco;
- ordenacao.

O fluxo dela e:

1. ler filtros da URL;
2. consultar o banco;
3. incluir categoria, marca, imagem, estoque e specs;
4. ordenar os resultados;
5. devolver tudo pronto para o frontend mostrar.

### `GET /products/:id`

Referencia: [`server/src/routes/productsRoutes.ts:101`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/routes/productsRoutes.ts:101)

Busca o detalhe de um produto especifico.

Exemplo:

- pessoa clica na pagina de um item;
- frontend manda o `id`;
- API responde com informacoes completas daquele item.

## Como o carrinho funciona

Arquivo: [`server/src/routes/cartRoutes.ts`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/routes/cartRoutes.ts:1)

Esse e um dos modulos mais importantes da API.

Ele cuida de:

- criar carrinho;
- adicionar item;
- alterar quantidade;
- remover item;
- limpar carrinho;
- finalizar compra.

### Funcoes auxiliares

#### `getOrCreateCart()`

Referencia: [`server/src/routes/cartRoutes.ts:32`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/routes/cartRoutes.ts:32)

Se o usuario ainda nao tiver carrinho, cria um.

Se ja tiver, reaproveita.

Isso evita que o frontend precise "abrir carrinho" manualmente.

#### `getCartPayload()`

Referencia: [`server/src/routes/cartRoutes.ts:40`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/routes/cartRoutes.ts:40)

Monta a resposta do carrinho de um jeito amigavel para a tela.

Em vez de devolver apenas ids, devolve:

- nome do produto;
- imagem;
- preco;
- categoria;
- quantidade;
- disponibilidade.

#### `getPromoDiscountRate()`

Referencia: [`server/src/routes/cartRoutes.ts:74`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/routes/cartRoutes.ts:74)

Interpreta regras simples de cupons promocionais.

### Rotas do carrinho

#### `GET /cart`

Referencia: [`server/src/routes/cartRoutes.ts:88`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/routes/cartRoutes.ts:88)

Retorna o carrinho atual do usuario.

#### `POST /cart/items`

Referencia: [`server/src/routes/cartRoutes.ts:98`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/routes/cartRoutes.ts:98)

Adiciona um produto ao carrinho.

Fluxo:

1. valida os dados;
2. garante que o carrinho exista;
3. confere se o produto existe;
4. calcula a nova quantidade;
5. salva no banco;
6. devolve o carrinho atualizado.

#### `PATCH /cart/items/:productId`

Referencia: [`server/src/routes/cartRoutes.ts:154`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/routes/cartRoutes.ts:154)

Altera a quantidade de um item.

Se a quantidade virar `0`, ele remove o item.

#### `DELETE /cart/items/:productId`

Referencia: [`server/src/routes/cartRoutes.ts:192`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/routes/cartRoutes.ts:192)

Remove um item especifico do carrinho.

#### `DELETE /cart/items`

Referencia: [`server/src/routes/cartRoutes.ts:209`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/routes/cartRoutes.ts:209)

Limpa o carrinho inteiro.

#### `POST /cart/checkout`

Referencia: [`server/src/routes/cartRoutes.ts:220`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/routes/cartRoutes.ts:220)

Essa e a rota que transforma o carrinho em pedido.

Em linguagem simples, ela faz:

1. verifica se o usuario esta autenticado;
2. valida metodo de pagamento e endereco;
3. le os itens do carrinho;
4. verifica se os produtos estao ativos;
5. verifica se existe estoque suficiente;
6. calcula subtotal, frete, imposto e desconto;
7. cria o pedido;
8. cria os itens do pedido;
9. registra um pagamento;
10. baixa o estoque;
11. limpa o carrinho;
12. devolve um resumo do pedido.

Esse processo usa transacao do banco.

Traduzindo:

- ou tudo funciona junto;
- ou nada fica salvo pela metade.

## Como o historico de pedidos funciona

Arquivo: [`server/src/routes/ordersRoutes.ts`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/routes/ordersRoutes.ts:1)

### `GET /orders/me`

Referencia: [`server/src/routes/ordersRoutes.ts:8`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/routes/ordersRoutes.ts:8)

Mostra os pedidos do usuario autenticado.

Serve para a pagina "meus pedidos" ou "historico".

## Como contato, newsletter e eventos funcionam

Arquivo: [`server/src/routes/engagementRoutes.ts`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/routes/engagementRoutes.ts:1)

Esse modulo guarda informacoes que nao sao exatamente compra, mas ajudam a loja a funcionar.

### `POST /contact/messages`

Referencia: [`server/src/routes/engagementRoutes.ts:26`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/routes/engagementRoutes.ts:26)

Salva mensagens enviadas pelo formulario de contato.

### `POST /newsletter/subscribe`

Referencia: [`server/src/routes/engagementRoutes.ts:36`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/routes/engagementRoutes.ts:36)

Registra ou reativa uma inscricao na newsletter.

### `POST /activity/events`

Referencia: [`server/src/routes/engagementRoutes.ts:54`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/routes/engagementRoutes.ts:54)

Grava eventos de atividade.

Exemplo:

- interacoes do usuario;
- eventos de navegacao;
- dados de uso.

### `POST /audit/events`

Referencia: [`server/src/routes/engagementRoutes.ts:68`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/routes/engagementRoutes.ts:68)

Grava eventos importantes ligados a um usuario autenticado.

## Como o chatbot funciona

Arquivos:

- [`server/src/routes/chatbotRoutes.ts`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/routes/chatbotRoutes.ts:1)
- [`server/src/routes/chatbot.ts`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/routes/chatbot.ts:1)

### `chatbotRoutes.ts`

#### `POST /chatbot`

Referencia: [`server/src/routes/chatbotRoutes.ts:7`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/routes/chatbotRoutes.ts:7)

Recebe a mensagem e delega para a logica principal.

### `chatbot.ts`

#### `chatbotRequestSchema`

Referencia: [`server/src/routes/chatbot.ts:5`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/routes/chatbot.ts:5)

Define os dados aceitos:

- mensagem;
- id da conversa;
- id da sessao.

#### `findProducts()`

Referencia: [`server/src/routes/chatbot.ts:25`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/routes/chatbot.ts:25)

Tenta localizar produtos que combinam com o texto enviado.

Nao e um motor de IA complexo.

Ele funciona mais como uma busca inteligente por palavras.

#### `normalizeText()`

Referencia: [`server/src/routes/chatbot.ts:49`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/routes/chatbot.ts:49)

Limpa e padroniza o texto para facilitar comparacoes.

#### `hasAny()`

Referencia: [`server/src/routes/chatbot.ts:59`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/routes/chatbot.ts:59)

Verifica se certas palavras-chave aparecem na mensagem.

#### `isGenericFollowUp()`

Referencia: [`server/src/routes/chatbot.ts:63`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/routes/chatbot.ts:63)

Detecta mensagens vagas, como pedidos de ajuda sem muito contexto.

#### `buildContextualMessage()`

Referencia: [`server/src/routes/chatbot.ts:76`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/routes/chatbot.ts:76)

Tenta juntar a mensagem atual com o contexto recente da conversa.

Isso ajuda quando a pessoa manda algo curto, como:

- "ate 300"
- "me mostra"

#### `generateAssistantReply()`

Referencia: [`server/src/routes/chatbot.ts:100`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/routes/chatbot.ts:100)

Monta a resposta textual do assistente.

Ele decide se deve:

- cumprimentar;
- mostrar produtos;
- falar de frete;
- falar de pagamento;
- passar canais de contato.

#### `handleChatbotMessage()`

Referencia: [`server/src/routes/chatbot.ts:151`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/routes/chatbot.ts:151)

E a funcao principal do chatbot.

Ela faz:

1. valida a mensagem;
2. cria ou encontra a conversa;
3. salva a mensagem do usuario;
4. busca mensagens recentes;
5. monta contexto;
6. escolhe produtos;
7. gera a resposta;
8. salva a resposta;
9. devolve o texto e as sugestoes.

## Como o frontend encontra a API

Arquivo: [`src/lib/api.ts`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/src/lib/api.ts:1)

Esse arquivo ajuda o frontend a descobrir "para onde enviar" as requisicoes.

### `isLocalhost()`

Referencia: [`src/lib/api.ts:1`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/src/lib/api.ts:1)

Verifica se o site esta rodando localmente.

### `normalizeBaseUrl()`

Referencia: [`src/lib/api.ts:5`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/src/lib/api.ts:5)

Apenas remove barra final, para evitar URLs montadas de forma estranha.

### `getApiUrl()`

Referencia: [`src/lib/api.ts:9`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/src/lib/api.ts:9)

Resolve a base da API.

Ele segue esta logica:

1. se existir `VITE_API_URL`, usa ela;
2. se estiver em `localhost`, usa `http://localhost:3001/api`;
3. senao, usa a mesma origem do site + `/api`.

### `getBackendUnavailableMessage()`

Referencia: [`src/lib/api.ts:27`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/src/lib/api.ts:27)

Devolve uma mensagem amigavel quando o backend nao responde.

## Como o frontend usa a autenticacao

Arquivo: [`src/lib/auth.ts`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/src/lib/auth.ts:1)

Esse arquivo e a ponte entre a tela de login/cadastro e a API.

### `BackendUnavailableError`

Referencia: [`src/lib/auth.ts:11`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/src/lib/auth.ts:11)

Representa o caso em que o backend nao esta disponivel.

### `isBackendUnavailableError()`

Referencia: [`src/lib/auth.ts:18`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/src/lib/auth.ts:18)

Ajuda a reconhecer falhas de indisponibilidade.

### `canUseLocalAuthFallback()`

Referencia: [`src/lib/auth.ts:22`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/src/lib/auth.ts:22)

Decide se o frontend pode usar autenticacao local como plano B.

### `readErrorMessage()`

Referencia: [`src/lib/auth.ts:47`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/src/lib/auth.ts:47)

Tenta ler a mensagem de erro enviada pela API.

### `readJsonOrThrow()`

Referencia: [`src/lib/auth.ts:76`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/src/lib/auth.ts:76)

Confirma se a resposta realmente veio em JSON.

### `registerUser()`

Referencia: [`src/lib/auth.ts:106`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/src/lib/auth.ts:106)

Faz o cadastro chamando `POST /auth/register`.

### `loginUser()`

Referencia: [`src/lib/auth.ts:138`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/src/lib/auth.ts:138)

Faz o login chamando `POST /auth/login`.

### `getProfile()`

Referencia: [`src/lib/auth.ts:164`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/src/lib/auth.ts:164)

Busca os dados do usuario logado com `GET /auth/me`.

### `setAuthToken()`, `getAuthToken()`, `clearAuthToken()`

Referencia: [`src/lib/auth.ts:194`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/src/lib/auth.ts:194)

Essas funcoes guardam, leem e removem o token do navegador.

## Como o frontend usa o carrinho

Arquivo: [`src/hooks/useCartPersistence.ts`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/src/hooks/useCartPersistence.ts:1)

Esse hook decide se o carrinho sera:

- remoto, usando a API;
- local, usando `localStorage`.

### `getCartKey()`

Referencia: [`src/hooks/useCartPersistence.ts:9`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/src/hooks/useCartPersistence.ts:9)

Define a chave usada para salvar carrinho local.

### `readJson()`

Referencia: [`src/hooks/useCartPersistence.ts:13`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/src/hooks/useCartPersistence.ts:13)

Le JSON do navegador.

### `fetchAuthJson()`

Referencia: [`src/hooks/useCartPersistence.ts:29`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/src/hooks/useCartPersistence.ts:29)

Envia chamadas autenticadas para a API.

### `useCartPersistence()`

Referencia: [`src/hooks/useCartPersistence.ts:67`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/src/hooks/useCartPersistence.ts:67)

E a funcao principal do carrinho no frontend.

Dentro dela, as pecas principais sao:

- `loadCartItems()`: carrega o carrinho;
- `addItem()`: adiciona produto;
- `removeItem()`: remove produto;
- `updateQuantity()`: altera quantidade;
- `clearCart()`: limpa tudo;
- `checkout()`: finaliza compra.

## Como o frontend usa o chatbot

Arquivo: [`src/components/chatbot/ChatbotWidget.tsx`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/src/components/chatbot/ChatbotWidget.tsx:1)

Esse componente e a interface visual do assistente.

### `formatMarkdownLinks()`

Referencia: [`src/components/chatbot/ChatbotWidget.tsx:41`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/src/components/chatbot/ChatbotWidget.tsx:41)

Transforma links em elementos clicaveis.

### `sendMessage()`

Referencia: [`src/components/chatbot/ChatbotWidget.tsx:124`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/src/components/chatbot/ChatbotWidget.tsx:124)

E a funcao principal da conversa no frontend.

Ela faz:

1. pega a mensagem digitada;
2. envia para `POST /chatbot`;
3. recebe a resposta;
4. guarda a conversa;
5. mostra sugestoes de produto.

Se a API falhar, ela cai em um modo local de resposta.

### `handleKeyPress()`

Referencia: [`src/components/chatbot/ChatbotWidget.tsx:221`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/src/components/chatbot/ChatbotWidget.tsx:221)

Permite enviar a mensagem apertando Enter.

## Resumo pratico da API

Se uma pessoa leiga quiser guardar uma ideia simples, pode pensar assim:

- `auth`: cuida de conta e login;
- `products`: mostra os produtos;
- `cart`: cuida do carrinho e da compra;
- `orders`: mostra pedidos feitos;
- `chatbot`: responde perguntas e sugere produtos;
- `contact/newsletter/events`: guardam interacoes e apoio ao negocio.

## Ordem recomendada para estudar

Se a ideia for entender o projeto aos poucos, esta ordem ajuda bastante:

1. [`server/.env.example`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/.env.example:1)
2. [`server/src/server.ts`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/server.ts:1)
3. [`server/prisma/schema.prisma`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/prisma/schema.prisma:1)
4. [`server/src/routes/authRoutes.ts`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/routes/authRoutes.ts:1) e [`server/src/routes/auth.ts`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/routes/auth.ts:1)
5. [`server/src/routes/productsRoutes.ts`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/routes/productsRoutes.ts:1)
6. [`server/src/routes/cartRoutes.ts`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/routes/cartRoutes.ts:1)
7. [`server/src/routes/ordersRoutes.ts`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/routes/ordersRoutes.ts:1)
8. [`server/src/routes/chatbotRoutes.ts`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/routes/chatbotRoutes.ts:1) e [`server/src/routes/chatbot.ts`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/routes/chatbot.ts:1)
9. [`src/lib/api.ts`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/src/lib/api.ts:1)
10. [`src/lib/auth.ts`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/src/lib/auth.ts:1), [`src/hooks/useCartPersistence.ts`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/src/hooks/useCartPersistence.ts:1) e [`src/components/chatbot/ChatbotWidget.tsx`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/src/components/chatbot/ChatbotWidget.tsx:1)

## Fechamento

Essa API foi desenhada para sustentar uma loja virtual com um backend relativamente simples, mas completo o bastante para:

- autenticar usuarios;
- listar produtos;
- controlar carrinho;
- criar pedidos;
- responder via chatbot;
- registrar interacoes extras.

Se quiser continuar, o proximo passo mais util costuma ser um destes:

1. fazer uma versao com exemplos de requisicao e resposta;
2. fazer uma versao com diagramas de fluxo;
3. fazer uma versao resumida para apresentacao ou TCC.
