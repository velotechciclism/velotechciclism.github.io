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

function generateAssistantReply(message: string, products: ReturnType<typeof findProducts>) {
  const lowerMessage = message.toLowerCase();

  if (products.length > 0) {
    const productLines = products
      .map((p) => `- ${p.name} (${p.category}) por EUR ${p.price.toFixed(2)}`)
      .join('\n');

    return `Encontrei algumas opcoes que combinam com o que voce pediu:\n${productLines}\n\nSe quiser, eu te ajudo a comparar por categoria, faixa de preco e uso (urbano, estrada ou trilha).`;
  }

  if (lowerMessage.includes('frete') || lowerMessage.includes('envio')) {
    return 'O frete e calculado no carrinho com base no total e no endereco. Posso te ajudar a simular uma compra para ver o valor final.';
  }

  if (lowerMessage.includes('pagamento') || lowerMessage.includes('cartao') || lowerMessage.includes('mb way')) {
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

  const products = findProducts(message);
  const assistantMessage = generateAssistantReply(message, products);

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
