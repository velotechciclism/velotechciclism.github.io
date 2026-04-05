import { z } from 'zod';
import { prisma } from '../prisma.js';

const chatbotRequestSchema = z.object({
  message: z.string().min(1, 'Mensagem obrigatoria').max(1200, 'Mensagem muito longa'),
  conversationId: z.string().optional().nullable(),
  sessionId: z.string().min(3, 'Sessao invalida').max(128, 'Sessao invalida'),
});

const catalog = [
  { id: '1', name: 'AeroSpeed Pro Helmet', category: 'Helmets', price: 74.99, tags: ['capacete', 'helmet', 'seguranca', 'mips'] },
  { id: '2', name: 'ProRace Elite Jersey', category: 'Apparel', price: 49.99, tags: ['camisa', 'jersey', 'roupa', 'vestuario'] },
  { id: '3', name: 'Carbon Apex Road Bike', category: 'Bicycles', price: 1599.99, tags: ['bicicleta', 'bike', 'speed', 'estrada'] },
  { id: '4', name: 'GripMax Pro Gloves', category: 'Accessories', price: 19.99, tags: ['luva', 'gloves', 'acessorio'] },
  { id: '7', name: 'MTB Trail Blazer', category: 'Bicycles', price: 1349.99, tags: ['mtb', 'trilha', 'mountain bike'] },
];

function findProducts(query: string) {
  const tokens = query
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 2);

  if (tokens.length === 0) {
    return [] as typeof catalog;
  }

  return catalog
    .map((product) => {
      const text = `${product.name} ${product.category} ${product.tags.join(' ')}`.toLowerCase();
      const score = tokens.reduce((sum, token) => (text.includes(token) ? sum + 1 : sum), 0);
      return { product, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((entry) => entry.product);
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function hasAny(text: string, words: string[]): boolean {
  return words.some((word) => text.includes(word));
}

function isGenericFollowUp(text: string): boolean {
  return hasAny(text, [
    'me ajuda',
    'ajuda',
    'quais itens tem',
    'quais produtos tem',
    'o que voces tem',
    'o que tem',
    'tem opcoes',
    'me mostra',
  ]);
}

function buildContextualMessage(message: string, recentUserMessages: string[]): string {
  const normalized = normalizeText(message);
  const hasBudgetOnly = /\b(ate|até|max|maximo|máximo)\b/.test(normalized) && /\d/.test(normalized);
  const genericFollowUp = isGenericFollowUp(normalized);

  if (!hasBudgetOnly && !genericFollowUp) {
    return message;
  }

  const lastInformative = [...recentUserMessages]
    .reverse()
    .map((item) => item.trim())
    .find((item) => {
      const normalizedItem = normalizeText(item);
      return normalizedItem.length >= 8 && !isGenericFollowUp(normalizedItem);
    });

  if (!lastInformative) {
    return message;
  }

  return `${lastInformative} ${message}`;
}

function generateAssistantReply(message: string, products: ReturnType<typeof findProducts>) {
  const normalized = normalizeText(message);

  const isGreeting = hasAny(normalized, ['oi', 'ola', 'hello', 'bom dia', 'boa tarde', 'boa noite']);
  const asksHelp = hasAny(normalized, ['me ajuda', 'me ajude', 'ajuda', 'suporte']);
  const asksCatalog = hasAny(normalized, [
    'quais itens tem',
    'quais produtos tem',
    'o que voces tem',
    'catalogo',
    'mostrar itens',
    'lista de produtos',
  ]);
  const asksSupportContact = hasAny(normalized, ['contato', 'atendente', 'humano', 'whatsapp', 'email', 'telefone']);

  if (asksSupportContact) {
    return 'Posso te dar suporte por aqui e tambem pelos canais diretos: WhatsApp +351 966 601 839, email c.eduardoteixeiraguinsber@gmail.com e telefone +351 210 123 456.';
  }

  if ((isGreeting || asksHelp) && products.length === 0) {
    return 'Oi! Posso te ajudar a escolher por tipo de uso (urbano, estrada, trilha), categoria e faixa de preco. Exemplos: "quais itens tem", "bike ate 900", "capacete para estrada".';
  }

  if (asksCatalog) {
    const sample = catalog
      .slice(0, 4)
      .map((p) => `- ${p.name} (${p.category}) por EUR ${p.price.toFixed(2)}`)
      .join('\n');

    return `Temos bicicletas, capacetes, vestuario e acessorios. Aqui vai uma amostra:\n${sample}\n\nSe quiser, eu filtro agora por categoria ou faixa de preco.`;
  }

  if (products.length > 0) {
    const productLines = products
      .map((p) => `- ${p.name} (${p.category}) por EUR ${p.price.toFixed(2)}`)
      .join('\n');

    return `Encontrei algumas opcoes que combinam com o que voce pediu:\n${productLines}\n\nSe quiser, eu te ajudo a comparar por categoria, faixa de preco e uso (urbano, estrada ou trilha).`;
  }

  if (hasAny(normalized, ['frete', 'envio', 'entrega', 'shipping'])) {
    return 'O frete e calculado no carrinho com base no total e no endereco. Posso te ajudar a simular uma compra para ver o valor final.';
  }

  if (hasAny(normalized, ['pagamento', 'cartao', 'mb way', 'multibanco', 'paypal', 'pix'])) {
    return 'Aceitamos cartao, MB WAY, multibanco e transferencia. Se quiser, eu te sugiro os produtos e voce finaliza no carrinho.';
  }

  return 'Posso te ajudar a escolher produtos de ciclismo por objetivo, nivel e faixa de preco. Me diga se voce procura bicicleta, capacete, roupas ou acessorios.';
}

export async function handleChatbotMessage(input: unknown) {
  const { message, conversationId, sessionId } = chatbotRequestSchema.parse(input);

  const conversation = conversationId
    ? await prisma.chatConversation.findUnique({ where: { id: conversationId } })
    : await prisma.chatConversation.create({ data: { sessionId } });

  if (!conversation) {
    throw new Error('Conversa nao encontrada');
  }

  await prisma.chatMessage.create({
    data: {
      conversationId: conversation.id,
      role: 'user',
      content: message,
    },
  });

  const recentUserMessages = await prisma.chatMessage.findMany({
    where: {
      conversationId: conversation.id,
      role: 'user',
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 6,
    select: {
      content: true,
    },
  });

  const contextualMessage = buildContextualMessage(
    message,
    recentUserMessages.map((item) => item.content)
  );

  const products = findProducts(contextualMessage);
  const assistantMessage = generateAssistantReply(contextualMessage, products);

  await prisma.chatMessage.create({
    data: {
      conversationId: conversation.id,
      role: 'assistant',
      content: assistantMessage,
    },
  });

  return {
    conversationId: conversation.id,
    message: assistantMessage,
    products,
  };
}
