# Roteiro de Video - Novos Ajustes VeloTech

## 1. Abertura

Neste video eu vou mostrar as novas funcionalidades adicionadas ao VeloTech, seguindo o plano de implementação enviado.

A ideia principal foi transformar o site em uma experiência mais profissional, com:

- login de usuário;
- permissões de administrador;
- painel administrativo;
- gestão de produtos;
- controle de stock;
- limite por usuário;
- avaliações persistentes;
- carrinho e pedidos salvos;
- chatbot mais integrado ao catálogo;
- visualização e exportação dos dados armazenados.

Tudo isso foi feito pensando em uma limitação importante: o site roda no GitHub Pages.

O GitHub Pages não executa backend Node.js, não roda servidor Express e não mantém um banco SQLite no servidor. Ele apenas entrega arquivos estáticos, como HTML, CSS, JavaScript, imagens e WebAssembly.

Por isso, a solução usada foi um SQLite local no navegador, usando `sql.js`, salvo dentro do IndexedDB. Em termos simples: o banco existe no navegador da pessoa que está usando o site.

## 2. Como o GitHub Pages influencia a arquitetura

Antes, quando pensamos em login, carrinho, pedidos e administração, normalmente imaginamos um backend remoto.

Um backend seria um servidor com API, por exemplo:

- `POST /api/auth/login`;
- `GET /api/products`;
- `POST /api/cart/checkout`;
- `GET /api/admin/users`.

O projeto até possui uma pasta `server/`, com Express, Prisma e SQLite. Essa parte serve como backend opcional caso um servidor Node seja publicado em outro lugar.

Mas no GitHub Pages isso não roda.

Então o frontend precisa funcionar sozinho. Para isso, o projeto usa:

- React para a interface;
- Vite para build;
- GitHub Pages para hospedagem;
- `sql.js` para rodar SQLite no navegador;
- IndexedDB para guardar o arquivo SQLite local;
- HashRouter para rotas como `#/products` e `#/admin`.

Essa escolha permite que o site funcione sem API externa e ainda tenha dados persistentes no navegador.

## 3. Arquivos principais alterados

### `src/lib/browserDatabase.ts`

Este arquivo é o coração do banco local.

Ele inicializa o SQLite WebAssembly, cria as tabelas e salva o banco dentro do IndexedDB.

As tabelas principais são:

- `local_users`: usuários, permissões e status;
- `cart_items`: itens do carrinho;
- `local_orders`: pedidos simulados;
- `local_order_items`: itens de cada pedido;
- `wishlist_items`: favoritos;
- `product_reviews`: avaliações;
- `contact_messages`: mensagens de contato;
- `newsletter_subscribers`: e-mails da newsletter;
- `chat_messages`: histórico do chatbot;
- `local_product_overrides`: ajustes administrativos de produto.

Também foi adicionada a função:

```ts
exportBrowserDatabase()
```

Ela permite exportar o banco SQLite inteiro como arquivo `.sqlite`.

Isso é importante porque, como não existe servidor no GitHub Pages, o administrador precisa de uma forma de pegar os dados salvos no navegador.

### `src/lib/localAuth.ts`

Este arquivo cuida do cadastro e login local.

Ele salva usuários no SQLite local e protege senhas com PBKDF2.

Também foram definidos e-mails que viram administradores automaticamente:

- `nunesnbnxn@gmail.com`;
- `c.eduardoteixeiraguinsber@gmail.com`.

Quando uma pessoa cria conta com um desses e-mails, o sistema salva o usuário com:

```ts
role = "admin"
status = "active"
```

Usuários comuns ficam com:

```ts
role = "customer"
```

### `src/pages/Auth.tsx`

Essa é a página de login e cadastro.

Foi removida a mensagem:

```txt
Modo local: esta conta fica somente neste navegador e nao sincroniza com outros dispositivos.
```

O objetivo foi deixar a experiência mais limpa para o usuário final.

### `src/pages/Admin.tsx`

Este é um dos arquivos mais importantes criados.

Ele adiciona a rota administrativa `/admin`.

O painel tem quatro áreas:

- Produtos;
- Usuários;
- Avaliações;
- Dados.

Na aba Produtos, o administrador pode:

- ver todos os produtos;
- adicionar produtos novos;
- editar nome, descrição, categoria, marca, preço e imagem;
- editar stock total;
- editar stock disponível;
- editar limite por usuário;
- ocultar ou mostrar produtos.

Na aba Conteúdo, o administrador pode:

- criar categorias locais;
- criar marcas locais;
- remover categorias/marcas locais;
- usar essas categorias e marcas no cadastro de produtos.

Na aba Usuários, o administrador pode:

- ver usuários cadastrados;
- promover usuários para administrador;
- remover permissão de administrador;
- bloquear usuários;
- desbloquear usuários.

Na aba Avaliações, o administrador pode:

- ver avaliações salvas;
- remover avaliações da vitrine.

Na aba Dados, o administrador consegue:

- ver dados armazenados no SQLite local;
- ver usuários;
- ver pedidos por usuário;
- ver total gasto por usuário;
- ver carrinhos;
- ver favoritos;
- ver contatos;
- ver newsletter;
- ver mensagens do chatbot;
- ver atividade recente;
- ver histórico de alterações de stock;
- exportar dados em JSON;
- baixar o banco `.sqlite`.

Essa aba substitui a ideia de um “SQLite remoto temporário”, porque o GitHub Pages não consegue receber uploads nem hospedar bancos gerados pelo usuário. Para ter um link temporário real, seria necessário um backend externo.

## 4. Gestão de produtos e stock

### `src/lib/localCatalog.ts`

Este arquivo foi criado para resolver um problema importante.

Os produtos originais continuam vindo de:

```ts
src/data/products.ts
```

Mas os ajustes feitos pelo administrador ficam em:

```sql
local_product_overrides
```

Isso significa que o produto base não é destruído. O sistema apenas aplica ajustes por cima.

Exemplo:

- o produto original tem nome, imagem, preço e categoria;
- o admin altera stock para 3;
- o sistema mostra o mesmo produto, mas com `stockAvailable = 3`.

As funções principais são:

```ts
getCatalogProducts()
```

Carrega os produtos já com os ajustes administrativos aplicados.

```ts
getCatalogProduct(productId)
```

Carrega um produto específico com stock, limite e visibilidade.

```ts
updateProductInventory()
```

Salva alterações de stock, limite por usuário e visibilidade no SQLite local.

## 5. Carrinho com limite e stock

### `src/hooks/useCartPersistence.ts`

O carrinho agora valida regras antes de adicionar produtos.

Antes, existia um limite global.

Agora o sistema considera:

- se o produto está em stock;
- quantas unidades estão disponíveis;
- qual é o `maxPerUser` daquele produto;
- quantas unidades já estão no carrinho.

Exemplo:

Se uma bicicleta tem:

```ts
maxPerUser = 1
stockAvailable = 3
```

O usuário só consegue colocar 1 unidade no carrinho, mesmo que existam 3 disponíveis.

Isso aproxima o projeto de uma loja real.

## 6. Produtos visíveis para o usuário

### `src/pages/Products.tsx`

A página de produtos passou a usar:

```ts
getCatalogProducts()
```

Isso significa que ela respeita:

- produtos ocultos pelo admin;
- stock atualizado;
- limite por usuário.

### `src/pages/ProductDetail.tsx`

A página de detalhe também passou a usar:

```ts
getCatalogProduct()
```

Agora ela mostra:

- stock disponível;
- limite por usuário;
- botão de carrinho bloqueado se não houver stock.

### `src/components/product/ProductCard.tsx`

Os cards da vitrine mostram informações de stock e limite.

Isso deixa as alterações administrativas visíveis para o usuário final.

## 7. Avaliações persistentes e moderação

### `src/pages/ProductReviews.tsx`

As avaliações são salvas em SQLite, na tabela:

```sql
product_reviews
```

Foi adicionado o campo:

```sql
status
```

Com isso, o admin pode remover uma avaliação da vitrine sem apagar todo o histórico imediatamente.

Na prática:

- `approved`: avaliação aparece;
- `rejected`: avaliação deixa de aparecer.

## 8. Chatbot mais integrado

### `src/lib/chatbotLocalRag.ts`

O chatbot local foi ajustado para usar o catálogo com as alterações administrativas.

Antes, ele lia diretamente a lista fixa de produtos.

Agora ele usa:

```ts
getCatalogProducts()
```

Isso faz com que o chatbot:

- não recomende produtos ocultos;
- considere disponibilidade de stock;
- trabalhe com o catálogo que o usuário realmente está vendo.

O chatbot continua sem usar API externa. Ele faz busca local por palavras, sinônimos, contexto recente e orçamento.

Depois dos novos ajustes, ele também passou a funcionar como um consultor de compra.

Ele tenta entender:

- o que a pessoa quer comprar;
- quanto pretende gastar;
- se o uso é trilha, estrada, urbano, treino ou infantil;
- se a pessoa é iniciante, intermediária ou avançada;
- se a prioridade é preço, conforto, segurança, resistência ou desempenho;
- se existe preferência por marca, cor, tamanho ou aro;
- se a pessoa está perguntando sobre stock, frete, pagamento ou finalização.

Com isso, o chatbot não apenas lista produtos. Ele explica por que cada opção faz sentido e orienta o usuário a abrir o produto e seguir para o carrinho.

Exemplos de perguntas melhores para demonstrar:

```txt
bike para trilha até 300
luvas baratas em stock
roupa para treino
presente para criança de 8 anos
compare duas opções
quero comprar uma bicicleta para iniciante
```

Também foram adicionados atalhos visuais no próprio widget, para o usuário clicar sem precisar digitar tudo.

## 9. Rotas e navegação

### `src/App.tsx`

Foi adicionada a rota:

```tsx
<Route path="/admin" element={<Admin />} />
```

Como o projeto usa `HashRouter`, no GitHub Pages a rota final fica assim:

```txt
https://velotechciclism.github.io/#/admin
```

### `src/components/layout/Header.tsx`

O menu do usuário foi atualizado.

Quando o usuário logado é administrador, aparece o link:

```txt
Administração
```

Usuários comuns não veem esse link.

## 10. Visualização dos dados armazenados

O painel admin ganhou a aba `Dados`.

Essa aba mostra uma visão simples dos dados que já existem no SQLite:

- usuários;
- carrinhos;
- pedidos;
- itens de pedido;
- favoritos;
- avaliações;
- mensagens de contato;
- newsletter;
- mensagens do chatbot;
- ajustes de produtos.

Também existem dois botões:

```txt
Exportar JSON
Baixar SQLite
```

O JSON é bom para leitura humana e apresentação.

O SQLite é bom para abrir em ferramentas como:

- DB Browser for SQLite;
- SQLiteStudio;
- extensões de SQLite no VS Code.

## 11. Sobre API e backend

O frontend está preparado para dois modos.

### Modo GitHub Pages

Este é o modo publicado atualmente.

Características:

- não usa servidor;
- não chama uma API real;
- salva dados no navegador;
- usa SQLite WebAssembly;
- funciona como demonstração profissional.

### Modo backend remoto

Existe uma pasta:

```txt
server/
```

Ela contém:

- Express;
- Prisma;
- SQLite de servidor;
- rotas de autenticação;
- rotas de carrinho;
- rotas de produtos;
- rotas de pedidos;
- rotas de chatbot.

Esse backend só funciona se for hospedado em algum servidor Node separado do GitHub Pages.

Exemplos de provedores possíveis:

- Render;
- Railway;
- Fly.io;
- VPS;
- servidor próprio.

Nesse caso, o frontend usaria uma variável:

```txt
VITE_API_URL
```

para apontar para a API.

## 12. Limitação importante

Como o GitHub Pages é estático, ele não consegue:

- receber dados de todos os usuários em um banco central;
- criar link temporário remoto sozinho;
- sincronizar contas entre navegadores;
- processar pagamento real;
- enviar e-mail real;
- hospedar um SQLite gerado pelo usuário.

Por isso, a solução atual é:

- dados locais para demonstração;
- exportação manual para auditoria;
- backend opcional para uma versão realmente centralizada.

## 13. Ajustes de revisão de checkout, selects e contato

Depois da revisão visual e funcional, foram feitos mais três ajustes.

### Checkout com cartão fictício

Arquivo principal:

```txt
src/pages/Cart.tsx
```

O carrinho recebeu uma área de pagamento mais completa. Agora o usuário pode escolher Visa, Mastercard, PayPal, MB Way, Apple Pay ou Google Pay.

Quando a opção é Visa ou Mastercard, aparece um formulário com:

- nome no cartão;
- número do cartão;
- validade;
- CVC;
- código postal de faturação.

Como o projeto roda no GitHub Pages e os dados são fictícios, esse formulário não processa cobrança real. Ele apenas valida os campos no navegador e registra no pedido somente o método de pagamento simulado, por exemplo:

```txt
Visa final 4242 (simulado)
```

O número completo do cartão e o CVC não são salvos no SQLite.

Funções adicionadas:

- `formatCardNumber`: formata o número do cartão em blocos de 4 dígitos.
- `formatExpiry`: formata a validade no padrão `MM/AA`.
- `isValidExpiry`: verifica se a validade informada ainda não expirou.
- `validatePayment`: valida os campos fictícios antes de finalizar a compra.

### Menus Select/Dropdown no tema escuro

Arquivos alterados:

```txt
src/components/ui/select.tsx
src/index.css
```

O componente Select baseado em Radix foi ajustado para usar fundo escuro, texto claro, bordas compatíveis com o tema e destaque amarelo ao focar itens.

Também foi adicionado CSS global para selects nativos, usado em telas como avaliações, cadastro, administração e autenticação. Isso corrige o problema de opções com fundo branco no tema escuro.

### Remoção da seção "Envie-nos uma Mensagem"

Arquivos alterados:

```txt
src/pages/Contact.tsx
src/locales/pt-br.json
```

A página de contato não mostra mais o formulário "Envie-nos uma Mensagem", porque ele poderia passar a impressão de envio real pelo site.

Agora a página exibe apenas canais funcionais para o usuário:

- telefone;
- e-mail;
- WhatsApp;
- endereço.

O texto introdutório também foi atualizado para orientar o usuário a usar esses canais.

### Prints de validação publicados

Os prints abaixo foram tirados da versão publicada em GitHub Pages, não apenas do ambiente local.

Checkout com formulário de cartão fictício:

```txt
https://velotechciclism.github.io/screenshots/07-checkout-pagamento-ficticio-cartao.png
```

Onde ver no site:

```txt
https://velotechciclism.github.io/#/cart
```

Observação: é necessário adicionar um produto ao carrinho antes de abrir a tela.

Página de contato sem o formulário "Envie-nos uma Mensagem":

```txt
https://velotechciclism.github.io/screenshots/08-contato-sem-formulario-mensagem.png
```

Onde ver no site:

```txt
https://velotechciclism.github.io/#/contact
```

Select/dropdown com tema escuro:

```txt
https://velotechciclism.github.io/screenshots/09-select-tema-escuro-produtos.png
```

Onde ver no site:

```txt
https://velotechciclism.github.io/#/products
```

## 14. Como demonstrar no video

1. Abrir o site publicado.
2. Mostrar a página de produtos.
3. Apontar que cada card mostra stock e limite.
4. Criar conta com um dos e-mails administradores.
5. Abrir o menu do usuário.
6. Clicar em Administração.
7. Mostrar os cards de estatísticas.
8. Entrar na aba Produtos.
9. Alterar o stock de um produto.
10. Voltar à vitrine e mostrar que a alteração aparece.
11. Entrar na aba Usuários.
12. Mostrar promoção, remoção de admin e bloqueio.
13. Entrar na aba Avaliações.
14. Mostrar moderação.
15. Entrar na aba Dados.
16. Mostrar usuários, pedidos e carrinhos.
17. Clicar em Exportar JSON.
18. Clicar em Baixar SQLite.
19. Explicar que esses arquivos substituem um link remoto no modo GitHub Pages.
20. Abrir o carrinho.
21. Mostrar o formulário de cartão fictício no checkout.
22. Explicar que os dados do cartão não são salvos.
23. Abrir uma tela com select, como avaliações ou administração.
24. Mostrar que o menu usa fundo escuro.
25. Abrir a página de contato.
26. Mostrar que o formulário foi removido e ficaram apenas canais reais.
27. Fechar explicando que a versão com banco central exigiria publicar o backend da pasta `server/`.

## 15. Resumo final para falar no video

O VeloTech agora tem um modo administrativo completo para demonstração em GitHub Pages.

Mesmo sem servidor, ele consegue salvar login, carrinho, pedidos, favoritos, avaliações, chatbot e ajustes administrativos usando SQLite dentro do navegador.

O administrador consegue controlar stock, limites por usuário, visibilidade dos produtos, usuários, avaliações e ainda exportar os dados armazenados.

Para um ambiente comercial real, o próximo passo seria publicar o backend remoto e trocar a persistência local por uma base centralizada.
