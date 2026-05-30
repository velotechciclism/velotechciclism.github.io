# API VeloTech

## O que esta API entrega

A API do VeloTech expõe a camada de serviços consumida pelo frontend da loja. Ela segue um estilo HTTP JSON simples, com rotas agrupadas por domínio, autenticação via bearer token e validação de payload com `zod`.

Ela não foi construída como uma API genérica de plataforma. Foi desenhada para sustentar a operação desta loja específica, com endpoints orientados a casos de uso concretos.

## Características principais

- prefixo principal em `/api`;
- payloads JSON;
- autenticação por JWT nas rotas privadas;
- validação de entrada com `zod`;
- respostas adaptadas ao formato esperado pelo frontend;
- health check simples para disponibilidade do serviço.

## Organização das rotas

### Autenticação

Base: `/api/auth`

- `POST /register`: cria conta e retorna usuário + token.
- `POST /login`: autentica usuário e retorna usuário + token.
- `GET /me`: retorna o perfil do usuário autenticado.

### Produtos

Base: `/api/products`

- `GET /meta`: entrega categorias e marcas disponíveis.
- `GET /`: lista produtos com busca, filtro e ordenação.
- `GET /:id`: retorna detalhe completo de um produto.

### Carrinho

Base: `/api/cart`

- `GET /`: obtém o carrinho do usuário.
- `POST /items`: adiciona item.
- `PATCH /items/:productId`: altera quantidade.
- `DELETE /items/:productId`: remove item específico.
- `DELETE /items`: limpa carrinho.
- `POST /checkout`: transforma carrinho em pedido.

### Pedidos

Base: `/api/orders`

- `GET /me`: lista pedidos do usuário autenticado.

### Chatbot

Base: `/api/chatbot`

- `POST /`: envia mensagem, recebe resposta e sugestões de produto.

### Engagement

Base: `/api`

- `POST /contact/messages`: salva mensagens de contato.
- `POST /newsletter/subscribe`: inscreve e reativa inscritos.
- `POST /activity/events`: registra eventos de atividade.
- `POST /audit/events`: registra eventos auditáveis de usuário autenticado.

### Observabilidade

- `GET /api/health`: retorna status do serviço.

## Como a API conversa com o frontend

O frontend resolve a URL base em `src/lib/api.ts` e a partir disso chama os endpoints com `fetch`.

Três padrões de uso aparecem com clareza:

1. autenticação em `src/lib/auth.ts`;
2. carrinho e checkout em `src/hooks/useCartPersistence.ts`;
3. chatbot em `src/components/chatbot/ChatbotWidget.tsx`.

Isso produz uma API bastante alinhada à interface, com payloads moldados para reduzir transformação no cliente.

## Contratos relevantes

### Contrato de autenticação

Resposta típica:

```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "Carlos",
    "phone": "+351...",
    "address": "Rua X",
    "created_at": "2026-05-23T10:00:00.000Z"
  },
  "token": "jwt..."
}
```

### Contrato de produto

A API de produtos retorna objetos já prontos para tela de catálogo, com:

- identificação;
- descrição;
- preço e preço original;
- imagem principal;
- categoria e marca;
- rating;
- disponibilidade;
- flags como `isNew` e `isFeatured`;
- `specs` como mapa chave/valor.

### Contrato de carrinho

O carrinho devolve uma lista enriquecida de itens, não apenas ids. Isso reduz chamadas adicionais do frontend.

### Contrato de chatbot

O endpoint devolve:

- `conversationId`;
- `message` do assistente;
- `products` sugeridos com id, nome, preço e categoria.

Esse contrato foi pensado para a UI já renderizar texto e atalhos de navegação ao mesmo tempo.

## Segurança e políticas de acesso

### JWT

Rotas privadas exigem header:

```http
Authorization: Bearer <token>
```

O middleware extrai o token, valida assinatura e injeta `userId` e `userEmail` na requisição.

### CORS

O backend aceita origens derivadas de `CLIENT_URL` e também trata cenários de loopback de forma explícita, o que facilita desenvolvimento local em `localhost`, `127.0.0.1` e variantes equivalentes.

### Rate limit

Existe limitação global de 300 requisições por janela de 15 minutos, protegendo a borda da API contra abuso básico.

## Processos importantes da API

### Busca e listagem de produtos

1. a API lê query params;
2. monta filtro Prisma por texto, categoria, marca e faixa de preço;
3. busca produtos ativos;
4. ordena em memória conforme o critério;
5. devolve payload pronto para o frontend.

### Checkout

1. validar payload;
2. garantir usuário autenticado;
3. abrir transação;
4. validar estoque e estado do produto;
5. calcular subtotal, frete, imposto e desconto;
6. criar pedido, itens, histórico e pagamento;
7. decrementar estoque;
8. limpar carrinho;
9. responder com resumo do pedido.

### Conversa do chatbot

1. validar mensagem, sessão e conversa;
2. persistir mensagem do usuário;
3. recuperar contexto recente da conversa;
4. localizar produtos por heurística textual;
5. gerar resposta contextual;
6. persistir mensagem do assistente;
7. devolver resposta com recomendações.

## Características arquiteturais da API

- orientada a casos de uso reais do front;
- payloads densos para evitar chamadas extras;
- autenticação simples e previsível;
- fronteira HTTP fácil de testar;
- baixa complexidade acidental;
- integração direta com Prisma sem camada excessiva de abstração.

## O que faz esta API ser adequada para este projeto

Ela combina bem com um e-commerce acadêmico ou demonstrativo porque:

- mantém o contrato legível;
- prioriza rotas que o frontend realmente usa;
- trata catálogo, compra e suporte no mesmo domínio;
- suporta modo conectado enquanto o frontend ainda preserva fallback local.