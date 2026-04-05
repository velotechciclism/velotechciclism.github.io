# Auditoria de Persistencia SQLite (VeloTech)

Data: 2026-04-05

## 1. Estado atual (evidencias)

Persistido hoje no backend (SQLite via Prisma):
- Usuarios: model `User`
- Chatbot: models `ChatConversation` e `ChatMessage`

Evidencias:
- `server/prisma/schema.prisma`
- `server/src/server.ts` (rotas apenas `/api/auth` e `/api/chatbot`)
- `server/src/routes/authRoutes.ts`
- `server/src/routes/chatbotRoutes.ts`

Nao persistido no backend (hoje em memoria/localStorage/frontend):
- Catalogo de produtos e metadados (`src/data/products.ts`)
- Carrinho (`src/hooks/useCartPersistence.ts`)
- Pedidos e itens de pedido (`src/hooks/useCartPersistence.ts`, `src/hooks/useOrders.ts`)
- Contato (formulario em `src/pages/Contact.tsx`)
- Newsletter (formulario no footer/blog)
- Reviews/avaliacoes (UI em `src/pages/ProductDetail.tsx` sem persistencia)
- Wishlist/favoritos (icone na UI, sem persistencia)

## 2. Lacunas de persistencia por dominio

### 2.1 Catalogo (critico)
Tabelas recomendadas:
- `Category`
- `Brand`
- `Product`
- `ProductImage`
- `ProductSpec`
- `Inventory`
- `PriceHistory` (opcional)

Campos minimos em `Product`:
- `id` (uuid/cuid), `sku` (unico), `slug` (unico)
- `name`, `description`, `categoryId`, `brandId`
- `price`, `originalPrice`, `currency`
- `isActive`, `isFeatured`, `isNew`
- `ratingAvg`, `reviewCount` (materializados)
- `createdAt`, `updatedAt`

### 2.2 Carrinho (critico)
Tabelas recomendadas:
- `Cart`
- `CartItem`

Campos chave:
- `Cart`: `id`, `userId` (nullable para guest), `sessionId` (guest), `expiresAt`
- `CartItem`: `cartId`, `productId`, `quantity`, `unitPriceSnapshot`, `createdAt`, `updatedAt`

### 2.3 Checkout e pedidos (critico)
Tabelas recomendadas:
- `Order`
- `OrderItem`
- `OrderStatusHistory`
- `Payment`
- `Shipment`
- `Address` (snapshot por pedido)

Campos chave em `Order`:
- `id`, `orderNumber`, `userId`
- `status` (pending/processing/paid/shipped/delivered/cancelled/refunded)
- `subtotal`, `shippingCost`, `tax`, `discount`, `total`, `currency`
- `paymentMethod`, `shippingAddressSnapshot`, `billingAddressSnapshot`
- `placedAt`, `createdAt`, `updatedAt`

### 2.4 Usuarios e seguranca (alto)
Ja existe `User`, mas faltam:
- `lastLoginAt`, `status`, `role`, `emailVerifiedAt`
- `UserSession` (refresh token/sessoes)
- `PasswordResetToken` e opcional `EmailVerificationToken`
- Normalizacao de telefone e enderecos estruturados

### 2.5 Monitoramento de atividade (alto)
Tabelas recomendadas:
- `AuditEvent` (seguranca/compliance)
- `UserActivityEvent` (analytics funcional)
- `ApiRequestLog` (opcional, com retencao)

Eventos minimos:
- auth: register/login/logout/login_failed
- ecommerce: product_view/add_to_cart/remove_from_cart/checkout_start/order_placed
- suporte: contact_submitted/chat_started/chat_message

### 2.6 Conteudo e marketing (medio)
Tabelas recomendadas:
- `ContactMessage`
- `NewsletterSubscriber`
- `BlogPost` (se o blog deixar de ser estatico)

### 2.7 Reputacao e social proof (medio)
Tabelas recomendadas:
- `ProductReview`
- `ReviewVote` (opcional)
- `Wishlist` e `WishlistItem`

## 3. Modelo relacional minimo (MVP robusto)

Implementar primeiro:
- `User` (expandido)
- `Category`, `Brand`, `Product`, `ProductImage`, `ProductSpec`, `Inventory`
- `Cart`, `CartItem`
- `Order`, `OrderItem`, `OrderStatusHistory`
- `Payment`, `Shipment`
- `ContactMessage`, `NewsletterSubscriber`
- `AuditEvent`, `UserActivityEvent`

## 4. Regras de integridade recomendadas

- Chaves unicas: `User.email`, `Product.sku`, `Product.slug`, `Order.orderNumber`
- FKs com cascade controlado:
  - `CartItem -> Cart` cascade
  - `OrderItem -> Order` cascade
  - `ProductImage/ProductSpec -> Product` cascade
- Indices:
  - `Product(categoryId, isActive)`
  - `Cart(userId, updatedAt)`
  - `Order(userId, createdAt)`
  - `UserActivityEvent(userId, eventType, createdAt)`

## 5. Conclusao executiva

Hoje o backend persiste apenas autenticacao basica e historico de chatbot.
Para refletir operacao real do site, e necessario mover para SQLite/Prisma pelo menos:
- catalogo completo
- carrinho
- pedidos/itens/pagamento/envio
- contato/newsletter
- atividade/auditoria

Sem isso, a operacao comercial principal continua dependente de localStorage e dados estaticos do frontend.
