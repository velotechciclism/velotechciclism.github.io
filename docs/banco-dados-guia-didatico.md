# Guia Didatico do Banco de Dados VeloTech

## O que e o banco de dados

Pense no banco de dados como o "arquivo central" da loja.

Se o frontend e a vitrine, e a API e o atendimento interno, o banco e o lugar onde as informacoes ficam guardadas de verdade.

Ele existe para lembrar coisas como:

- quem sao os usuarios;
- quais produtos existem;
- quanto tem em estoque;
- o que cada pessoa colocou no carrinho;
- quais pedidos ja foram feitos;
- quais mensagens foram enviadas no chatbot;
- quem entrou na newsletter;
- quais eventos importantes aconteceram.

Sem banco de dados, o sistema ate poderia funcionar por alguns instantes, mas esqueceria tudo depois.

## Como imaginar isso de forma simples

Imagine varias gavetas organizadas.

Cada gaveta guarda um tipo de informacao:

- uma gaveta para usuarios;
- uma gaveta para produtos;
- uma gaveta para pedidos;
- uma gaveta para mensagens do chatbot.

No banco de dados, essas "gavetas" sao chamadas de tabelas ou modelos.

Cada tabela guarda registros.

Exemplo:

- a tabela `User` guarda usuarios;
- um registro dessa tabela representa uma pessoa.

## Onde o banco esta definido

O desenho do banco esta em [`server/prisma/schema.prisma`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/prisma/schema.prisma:1).

Esse arquivo e a "planta" do banco.

Ele diz:

- quais tabelas existem;
- quais campos cada tabela possui;
- como as tabelas se conectam;
- quais campos precisam ser unicos;
- o que acontece quando um dado depende do outro.

## Qual tecnologia o projeto usa

Hoje o projeto usa:

- `SQLite` como banco;
- `Prisma` como camada que organiza o acesso ao banco.

### O que isso significa

#### SQLite

O SQLite e um banco simples que fica em arquivo.

Em vez de precisar de um servidor de banco separado, ele pode funcionar localmente com um arquivo do tipo:

```env
DATABASE_URL="file:./dev.db"
```

Vantagem:

- e facil de instalar;
- e bom para estudo, prototipo, TCC e demos.

#### Prisma

O Prisma funciona como um tradutor entre o codigo e o banco.

Em vez de escrever consultas SQL o tempo inteiro, o sistema pode fazer coisas como:

- buscar usuarios;
- criar pedidos;
- atualizar estoque;
- gravar mensagens.

## Como o banco se encaixa no sistema

Fluxo simples:

1. a pessoa usa o site;
2. o frontend chama a API;
3. a API decide o que fazer;
4. a API conversa com o banco;
5. o banco devolve ou salva os dados;
6. a API responde ao frontend.

Exemplo real:

1. a pessoa adiciona uma bicicleta ao carrinho;
2. a API recebe esse pedido;
3. a API salva o item no banco;
4. quando a pessoa abrir o carrinho depois, o item continua la.

## Onde a conexao com o banco acontece

Arquivo: [`server/src/prisma.ts`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/prisma.ts:1)

Esse arquivo e bem pequeno, mas muito importante.

Ele cria a conexao principal com o banco e exporta essa conexao para o resto do backend.

Em linguagem simples:

- e como se ele abrisse a porta do arquivo central;
- depois, os outros arquivos entram por essa mesma porta para ler e escrever dados.

## Como ler o schema sem se assustar

Quando voce abre [`schema.prisma`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/prisma/schema.prisma:1), aparecem varios blocos.

Os principais sao:

- `generator`: diz como o Prisma vai gerar o cliente;
- `datasource`: diz qual banco esta sendo usado;
- `model`: representa tabelas;
- `enum`: representa listas fixas de valores permitidos.

## Primeira parte do schema

### `generator client`

Referencia: [`server/prisma/schema.prisma:1`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/prisma/schema.prisma:1)

Esse bloco diz ao Prisma para gerar o cliente que o backend usa em tempo de execucao.

### `datasource db`

Referencia: [`server/prisma/schema.prisma:5`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/prisma/schema.prisma:5)

Esse bloco diz qual banco sera usado.

Hoje:

- o provider e `sqlite`;
- a URL vem da variavel `DATABASE_URL`.

## Grupo 1: usuarios

### Tabela `User`

Referencia: [`server/prisma/schema.prisma:10`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/prisma/schema.prisma:10)

Essa tabela guarda as pessoas que usam o sistema.

Campos mais importantes:

- `id`: identificador do usuario;
- `email`: e-mail da pessoa;
- `name`: nome;
- `password`: senha salva de forma protegida;
- `phone`: telefone;
- `address`: endereco;
- `role`: tipo de usuario;
- `status`: situacao da conta;
- `createdAt`: quando a conta foi criada;
- `updatedAt`: quando foi atualizada.

### Como pensar nela

Se a API precisa saber "quem e esta pessoa?", ela olha para `User`.

### Campos que merecem atencao

#### `email @unique`

Quer dizer que nao pode haver dois usuarios com o mesmo e-mail.

#### `role`

Hoje existe:

- `customer`
- `admin`

Em termos simples:

- `customer` e cliente comum;
- `admin` seria um usuario com mais permissao.

#### `status`

Hoje existe:

- `active`
- `blocked`

Ou seja:

- a conta pode estar ativa;
- ou pode estar bloqueada.

## Grupo 2: categorias e marcas

### Tabela `Category`

Referencia: [`server/prisma/schema.prisma:32`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/prisma/schema.prisma:32)

Guarda categorias de produtos.

Exemplos:

- bicicletas;
- roupas;
- acessorios.

Campos principais:

- `slug`: nome tecnico unico;
- `name`: nome visivel;
- `description`: descricao;
- `imageUrl`: imagem da categoria;
- `isActive`: se esta ativa ou nao.

### Tabela `Brand`

Referencia: [`server/prisma/schema.prisma:45`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/prisma/schema.prisma:45)

Guarda as marcas dos produtos.

Exemplo:

- Shimano;
- WATSON;
- Eleven.

Campos principais:

- `slug`;
- `name`.

## Grupo 3: produtos

### Tabela `Product`

Referencia: [`server/prisma/schema.prisma:55`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/prisma/schema.prisma:55)

Essa e uma das tabelas mais importantes do sistema.

Ela representa o produto em si.

Campos principais:

- `id`: identificador do produto;
- `sku`: codigo interno unico;
- `slug`: nome tecnico usado em URLs;
- `name`: nome do produto;
- `description`: descricao;
- `categoryId`: liga o produto a uma categoria;
- `brandId`: liga o produto a uma marca;
- `price`: preco atual;
- `originalPrice`: preco original;
- `currency`: moeda;
- `ratingAvg`: media das avaliacoes;
- `reviewCount`: quantidade de avaliacoes;
- `isNew`: se aparece como novo;
- `isFeatured`: se aparece como destaque;
- `isActive`: se pode ser exibido e vendido.

### Como pensar nessa tabela

Se a loja fosse um estoque organizado, `Product` seria a ficha principal de cada item.

## Grupo 4: imagens e especificacoes do produto

### Tabela `ProductImage`

Referencia: [`server/prisma/schema.prisma:88`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/prisma/schema.prisma:88)

Guarda as imagens de um produto.

Por que existe separada?

Porque um produto pode ter:

- uma imagem principal;
- varias imagens extras.

Campos principais:

- `productId`: de qual produto e a imagem;
- `url`: endereco da imagem;
- `sortOrder`: ordem em que ela aparece.

### Tabela `ProductSpec`

Referencia: [`server/prisma/schema.prisma:100`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/prisma/schema.prisma:100)

Guarda caracteristicas tecnicas do produto.

Exemplos:

- cor;
- tamanho;
- tipo;
- aro;
- uso recomendado.

Campos principais:

- `name`: nome da especificacao;
- `value`: valor da especificacao;
- `sortOrder`: ordem de exibicao.

## Grupo 5: estoque

### Tabela `Inventory`

Referencia: [`server/prisma/schema.prisma:112`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/prisma/schema.prisma:112)

Guarda a quantidade disponivel de cada produto.

Campos principais:

- `productId`: qual produto esta sendo controlado;
- `stock`: quantidade em estoque;
- `reserved`: quantidade reservada;
- `updatedAt`: ultima atualizacao.

### Como pensar nessa tabela

Ela responde perguntas como:

- "ainda tem esse item?"
- "quantas unidades restam?"

## Grupo 6: carrinho

### Tabela `Cart`

Referencia: [`server/prisma/schema.prisma:121`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/prisma/schema.prisma:121)

Representa o carrinho do usuario.

Campos principais:

- `id`: id do carrinho;
- `userId`: dono do carrinho;
- `createdAt`;
- `updatedAt`.

### Como pensar nessa tabela

Ela e como a "cesta" principal da compra.

### Tabela `CartItem`

Referencia: [`server/prisma/schema.prisma:131`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/prisma/schema.prisma:131)

Guarda os itens que estao dentro do carrinho.

Campos principais:

- `cartId`: em qual carrinho esta;
- `productId`: qual produto foi colocado;
- `quantity`: quantidade;
- `unitPriceSnapshot`: preco daquele produto no momento em que entrou no carrinho.

### O que e `unitPriceSnapshot`

Esse nome parece tecnico, mas a ideia e boa:

- se o preco do produto mudar depois;
- o carrinho ainda lembra o preco que estava valendo naquele momento.

Isso ajuda na coerencia do processo de compra.

### Regra importante

Em [`server/prisma/schema.prisma:143`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/prisma/schema.prisma:143) existe:

```prisma
@@unique([cartId, productId])
```

Traduzindo:

- o mesmo produto nao deve aparecer duplicado dentro do mesmo carrinho;
- em vez disso, a quantidade e atualizada.

## Grupo 7: pedidos

### Tabela `Order`

Referencia: [`server/prisma/schema.prisma:146`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/prisma/schema.prisma:146)

Representa um pedido fechado.

Campos principais:

- `orderNumber`: numero unico do pedido;
- `userId`: quem comprou;
- `status`: situacao do pedido;
- `subtotal`: soma dos itens;
- `shippingCost`: custo do frete;
- `tax`: imposto;
- `discount`: desconto;
- `total`: valor final;
- `paymentMethod`: metodo de pagamento;
- `shippingAddressSnapshot`: endereco salvo no momento da compra;
- `createdAt`;
- `updatedAt`.

### Como pensar nessa tabela

Ela e o "documento principal" da compra.

## Grupo 8: itens do pedido

### Tabela `OrderItem`

Referencia: [`server/prisma/schema.prisma:172`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/prisma/schema.prisma:172)

Guarda tudo o que foi comprado dentro de um pedido.

Campos principais:

- `orderId`: qual pedido e esse;
- `productId`: qual produto foi comprado;
- `productName`: nome do produto naquele momento;
- `productImage`: imagem principal naquele momento;
- `quantity`: quantidade;
- `unitPrice`: preco unitario;
- `totalPrice`: total daquele item.

### Por que copiar nome e imagem?

Porque o produto pode mudar no futuro.

Exemplo:

- nome do produto muda;
- imagem muda;
- descricao muda.

Mesmo assim, o pedido antigo precisa continuar mostrando o que foi comprado na epoca.

## Grupo 9: historico do pedido

### Tabela `OrderStatusHistory`

Referencia: [`server/prisma/schema.prisma:186`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/prisma/schema.prisma:186)

Guarda a trilha de status do pedido.

Exemplo:

- pedido criado;
- em processamento;
- pago;
- enviado;
- entregue.

Campos principais:

- `orderId`;
- `status`;
- `note`;
- `createdAt`.

### Como pensar nessa tabela

Em vez de guardar so o status atual, ela guarda o historico do caminho percorrido.

## Grupo 10: pagamento

### Tabela `Payment`

Referencia: [`server/prisma/schema.prisma:198`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/prisma/schema.prisma:198)

Guarda os dados do pagamento do pedido.

Campos principais:

- `orderId`;
- `method`;
- `amount`;
- `currency`;
- `status`;
- `externalRef`.

### Como pensar nessa tabela

Ela responde perguntas como:

- "como a pessoa tentou pagar?"
- "qual foi o valor?"
- "o pagamento foi concluido?"

## Grupo 11: envio

### Tabela `Shipment`

Referencia: [`server/prisma/schema.prisma:211`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/prisma/schema.prisma:211)

Guarda a parte de envio e entrega.

Campos principais:

- `orderId`;
- `carrier`: transportadora;
- `trackingNumber`: codigo de rastreio;
- `status`;
- `shippedAt`;
- `deliveredAt`.

### Como pensar nessa tabela

Ela guarda a vida logistica do pedido depois da compra.

## Grupo 12: avaliacoes

### Tabela `ProductReview`

Referencia: [`server/prisma/schema.prisma:224`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/prisma/schema.prisma:224)

Guarda avaliacoes feitas pelos usuarios.

Campos principais:

- `productId`;
- `userId`;
- `rating`;
- `title`;
- `content`;
- `isApproved`;
- `createdAt`.

### Regra importante

Em [`server/prisma/schema.prisma:238`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/prisma/schema.prisma:238) existe:

```prisma
@@unique([productId, userId])
```

Traduzindo:

- cada usuario pode avaliar um produto uma vez.

## Grupo 13: lista de desejos

### Tabela `Wishlist`

Referencia: [`server/prisma/schema.prisma:241`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/prisma/schema.prisma:241)

Representa a lista de desejos do usuario.

### Tabela `WishlistItem`

Referencia: [`server/prisma/schema.prisma:251`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/prisma/schema.prisma:251)

Guarda os produtos marcados como favoritos.

### Como pensar nesse grupo

Ele permite lembrar:

- "esse usuario gostou desse item"
- "esse usuario quer guardar esse produto para depois"

## Grupo 14: contato e newsletter

### Tabela `ContactMessage`

Referencia: [`server/prisma/schema.prisma:263`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/prisma/schema.prisma:263)

Guarda mensagens enviadas no formulario de contato.

Campos principais:

- `name`;
- `email`;
- `subject`;
- `message`;
- `status`;
- `createdAt`.

### Tabela `NewsletterSubscriber`

Referencia: [`server/prisma/schema.prisma:273`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/prisma/schema.prisma:273)

Guarda quem entrou na newsletter.

Campos principais:

- `email`;
- `status`;
- `createdAt`;
- `unsubscribedAt`.

## Grupo 15: eventos e auditoria

### Tabela `UserActivityEvent`

Referencia: [`server/prisma/schema.prisma:281`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/prisma/schema.prisma:281)

Guarda eventos de uso do sistema.

Exemplo:

- cliques;
- interacoes;
- eventos de navegacao;
- eventos ligados a sessao.

Campos principais:

- `userId`;
- `sessionId`;
- `eventType`;
- `metadata`;
- `createdAt`.

### Tabela `AuditEvent`

Referencia: [`server/prisma/schema.prisma:295`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/prisma/schema.prisma:295)

Guarda eventos mais sensiveis ou importantes.

Exemplo:

- acao importante de usuario;
- evento que precisa ficar rastreado;
- registro de auditoria.

Campos principais:

- `userId`;
- `eventType`;
- `resource`;
- `resourceId`;
- `metadata`;
- `createdAt`.

## Grupo 16: chatbot

### Tabela `ChatConversation`

Referencia: [`server/prisma/schema.prisma:310`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/prisma/schema.prisma:310)

Representa uma conversa.

Campos principais:

- `id`;
- `sessionId`;
- `createdAt`.

### Tabela `ChatMessage`

Referencia: [`server/prisma/schema.prisma:319`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/prisma/schema.prisma:319)

Guarda cada mensagem da conversa.

Campos principais:

- `conversationId`;
- `role`: quem falou;
- `content`: conteudo da mensagem;
- `createdAt`.

### Como pensar nesse grupo

Ele permite que o sistema lembre:

- qual foi a conversa;
- o que o usuario disse;
- o que o assistente respondeu.

## O que sao os relacionamentos

Relacionamentos sao os "fios" que ligam uma tabela a outra.

Exemplos simples:

- um usuario pode ter um carrinho;
- um carrinho pode ter varios itens;
- um pedido pode ter varios itens;
- um produto pode ter varias imagens.

## Relacionamentos mais faceis de entender

### Usuario e carrinho

Um `User` pode ter um `Cart`.

Traduzindo:

- cada pessoa autenticada pode ter seu proprio carrinho.

### Usuario e pedidos

Um `User` pode ter varios `Order`.

Traduzindo:

- uma pessoa pode comprar varias vezes.

### Categoria e produto

Uma `Category` pode ter varios `Product`.

Traduzindo:

- uma categoria agrupa varios produtos.

### Produto e imagens

Um `Product` pode ter varias `ProductImage`.

Traduzindo:

- um produto pode aparecer com varias fotos.

### Pedido e itens

Um `Order` pode ter varios `OrderItem`.

Traduzindo:

- um pedido quase sempre tem mais de um detalhe guardado internamente.

### Conversa e mensagens

Uma `ChatConversation` pode ter varias `ChatMessage`.

Traduzindo:

- uma conversa e formada por varias falas.

## O que sao `@unique`, `@@unique` e indices

Essas marcas ajudam o banco a se organizar melhor.

### `@unique`

Quer dizer que aquele campo precisa ser unico.

Exemplo:

- dois usuarios nao devem ter o mesmo e-mail.

### `@@unique`

Quer dizer que a combinacao de campos precisa ser unica.

Exemplo:

- o mesmo produto nao deve aparecer duplicado no mesmo carrinho.

### `@@index`

Quer dizer que o banco cria um atalho para encontrar dados com mais eficiencia.

Em termos simples:

- melhora buscas;
- ajuda desempenho.

## O que significa `onDelete: Cascade`

Esse detalhe aparece em varias relacoes.

Em linguagem leiga, significa:

- se o registro principal for apagado;
- os registros dependentes tambem sao apagados automaticamente.

Exemplo:

- se um carrinho fosse apagado;
- os itens daquele carrinho tambem iriam embora.

## Como o banco participa de fluxos reais

### Fluxo 1: cadastro de usuario

1. a pessoa envia nome, e-mail e senha;
2. a API valida os dados;
3. a tabela `User` recebe esse novo cadastro;
4. depois a pessoa pode entrar com aquele e-mail.

### Fluxo 2: abrir catalogo

1. o frontend pede a lista de produtos;
2. a API consulta `Product`;
3. traz junto `Category`, `Brand`, `ProductImage`, `ProductSpec` e `Inventory`;
4. a tela mostra o catalogo.

### Fluxo 3: adicionar ao carrinho

1. o usuario escolhe um produto;
2. a API garante que existe um `Cart`;
3. grava ou atualiza um `CartItem`;
4. o carrinho fica salvo.

### Fluxo 4: finalizar compra

1. a API le o `Cart`;
2. consulta os `CartItem`;
3. verifica `Inventory`;
4. cria `Order`;
5. cria `OrderItem`;
6. cria `Payment`;
7. atualiza o estoque;
8. limpa o carrinho.

### Fluxo 5: chatbot

1. o usuario manda uma mensagem;
2. a API cria ou acha uma `ChatConversation`;
3. salva a fala em `ChatMessage`;
4. gera a resposta;
5. salva a resposta em outra `ChatMessage`.

## Como estudar esse banco aos poucos

Se a ideia for aprender sem se perder, esta ordem ajuda:

1. [`server/src/prisma.ts`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/src/prisma.ts:1)
2. [`server/prisma/schema.prisma`](/home/nunerd/Área%20de%20trabalho/Velotech/velotechciclism.github.io/server/prisma/schema.prisma:1)
3. ler primeiro `User`, `Category`, `Brand`, `Product`, `Inventory`
4. depois `Cart` e `CartItem`
5. depois `Order`, `OrderItem`, `Payment`, `Shipment`
6. por fim `ChatConversation`, `ChatMessage`, `ContactMessage`, `NewsletterSubscriber`, `AuditEvent`

## Resumo rapido

Se voce quiser guardar so a ideia principal, pense assim:

- `User`: quem usa o sistema;
- `Product`: o que a loja vende;
- `Inventory`: quanto ainda tem;
- `Cart` e `CartItem`: o que a pessoa pretende comprar;
- `Order` e `OrderItem`: o que a pessoa realmente comprou;
- `Payment`: como ficou o pagamento;
- `Shipment`: como ficou a entrega;
- `ChatConversation` e `ChatMessage`: o historico do assistente;
- `ContactMessage` e `NewsletterSubscriber`: relacionamento com o cliente;
- `UserActivityEvent` e `AuditEvent`: rastreio do que aconteceu.

## Fechamento

O banco de dados do VeloTech nao guarda apenas produtos.

Ele foi desenhado para guardar a historia completa da loja:

- quem entrou;
- o que viu;
- o que colocou no carrinho;
- o que comprou;
- o que perguntou no chatbot;
- e quais eventos importantes aconteceram.

Se quiser, no proximo passo eu posso fazer uma versao complementar com:

1. diagramas visuais das relacoes entre tabelas;
2. explicacao de cada campo em formato de tabela;
3. exemplos práticos de como uma compra percorre o banco do inicio ao fim.
