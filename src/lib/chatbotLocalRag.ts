import { products } from '@/data/products';

type RagProduct = {
  id: string;
  name: string;
  price: number;
  category: string;
  brand: string;
  description: string;
  score: number;
  path: string;
};

export type LocalRagResponse = {
  message: string;
  products: RagProduct[];
};

type LocalRagContext = {
  recentUserMessages?: string[];
};

const synonymMap: Record<string, string[]> = {
  bike: ['bicicleta', 'bici', 'speed', 'estrada', 'road', 'mtb', 'gravel', 'urbana'],
  bicicleta: ['bike', 'bici', 'speed', 'estrada', 'road', 'mtb', 'gravel', 'urbana'],
  capacete: ['helmet', 'seguranca', 'mips', 'aero'],
  helmet: ['capacete', 'seguranca', 'mips', 'aero'],
  luva: ['glove', 'gloves', 'acessorio', 'pegada'],
  glove: ['luva', 'gloves', 'acessorio', 'pegada'],
  jersey: ['camisa', 'vestuario', 'roupa', 'apparel'],
  camisa: ['jersey', 'vestuario', 'roupa', 'apparel'],
  ajuda: ['help', 'suporte', 'orientacao', 'recomendacao'],
  comprar: ['compra', 'checkout', 'pedido', 'carrinho'],
  barato: ['economico', 'preco', 'custo', 'desconto'],
  caro: ['premium', 'alto desempenho', 'topo de linha'],
  frete: ['envio', 'entrega', 'shipping'],
  pagamento: ['cartao', 'mb way', 'multibanco', 'paypal', 'pix'],
};

const intentLexicon = {
  greeting: ['oi', 'ola', 'hello', 'eae', 'salve', 'bom', 'boa', 'hey'],
  help: ['ajuda', 'help', 'suporte', 'como', 'funciona', 'orienta'],
  catalog: ['itens', 'item', 'catalogo', 'produtos', 'quais', 'tem', 'mostrar', 'lista'],
  support: ['atendimento', 'suporte', 'contato', 'whatsapp', 'email', 'telefone', 'humano'],
  shipping: ['frete', 'envio', 'entrega', 'shipping', 'prazo'],
  payment: ['pagamento', 'cartao', 'mb way', 'multibanco', 'paypal', 'pix'],
  recommendation: ['recomenda', 'sugere', 'ideal', 'indica', 'melhor', 'quero'],
  checkout: ['comprar', 'compra', 'checkout', 'finalizar', 'pedido', 'carrinho'],
};

const typoMap: Record<string, string> = {
  oiie: 'oi',
  oii: 'oi',
  olaa: 'ola',
  ajdua: 'ajuda',
  ajuada: 'ajuda',
  palavreas: 'palavras',
};

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(text: string): string[] {
  return normalize(text)
    .split(' ')
    .map((token) => typoMap[token] || token)
    .filter((token) => token.length > 1);
}

function hasPhrase(query: string, phrases: string[]): boolean {
  return phrases.some((phrase) => query.includes(phrase));
}

function expandTokens(tokens: string[]): string[] {
  const expanded = new Set<string>(tokens);

  for (const token of tokens) {
    const synonyms = synonymMap[token] || [];
    for (const synonym of synonyms) {
      expanded.add(synonym);
    }
  }

  return [...expanded];
}

function detectBudget(query: string): number | null {
  const matches = query.match(/(\d+[.,]?\d*)/g);
  if (!matches || matches.length === 0) {
    return null;
  }

  const value = Number(matches[0].replace(',', '.'));
  return Number.isFinite(value) ? value : null;
}

function detectIntent(expandedTokens: string[]): keyof typeof intentLexicon | null {
  let bestIntent: keyof typeof intentLexicon | null = null;
  let bestScore = 0;

  for (const [intent, words] of Object.entries(intentLexicon) as Array<[
    keyof typeof intentLexicon,
    string[]
  ]>) {
    const score = words.reduce((sum, word) => (expandedTokens.includes(word) ? sum + 1 : sum), 0);
    if (score > bestScore) {
      bestScore = score;
      bestIntent = intent;
    }
  }

  return bestScore > 0 ? bestIntent : null;
}

function rankProducts(query: string): RagProduct[] {
  const baseTokens = tokenize(query);
  const expandedTokens = expandTokens(baseTokens);
  const budget = detectBudget(query);

  const ranked = products
    .map((product) => {
      const specsText = product.specs ? Object.values(product.specs).join(' ') : '';
      const doc = normalize(
        `${product.name} ${product.description} ${product.category} ${product.brand} ${specsText}`
      );

      const tokenScore = expandedTokens.reduce(
        (score, token) => (doc.includes(token) ? score + 1 : score),
        0
      );

      const categoryBoost = expandedTokens.includes(product.category.toLowerCase()) ? 2 : 0;
      const featuredBoost = product.isFeatured ? 0.5 : 0;
      const stockBoost = product.inStock ? 0.5 : -1;

      const budgetPenalty = budget && product.price > budget * 1.15 ? -2 : 0;

      return {
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category,
        brand: product.brand,
        description: product.description,
        path: `/products/${product.id}`,
        score: tokenScore + categoryBoost + featuredBoost + stockBoost + budgetPenalty,
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  return ranked;
}

function formatProductList(items: RagProduct[]): string {
  return items
    .map((item) => `- [${item.name}](${item.path}) (${item.category}) por EUR ${item.price.toFixed(2)}`)
    .join('\n');
}

function buildNaturalAnswer(query: string, productsRanked: RagProduct[]): string {
  const normalizedQuery = normalize(query);
  const expandedTokens = expandTokens(tokenize(normalizedQuery));
  const intent = detectIntent(expandedTokens);

  const wantsCatalog =
    intent === 'catalog' ||
    hasPhrase(normalizedQuery, [
      'quais itens tem',
      'quais produtos tem',
      'o que voces tem',
      'oque voces tem',
      'mostrar itens',
    ]);

  const wantsGreeting =
    intent === 'greeting' ||
    hasPhrase(normalizedQuery, ['oi', 'ola', 'bom dia', 'boa tarde', 'boa noite']);

  const wantsHelp = intent === 'help' || hasPhrase(normalizedQuery, ['me ajuda', 'me ajude']);

  if (intent === 'support') {
    return 'Claro. Posso te atender por suporte direto tambem: WhatsApp +351 966 601 839, email c.eduardoteixeiraguinsber@gmail.com e telefone +351 210 123 456. Se preferir, eu continuo por aqui com recomendacoes.';
  }

  if (wantsGreeting && productsRanked.length === 0) {
    return 'Oi! Estou aqui para ajudar voce a encontrar o produto certo. Posso recomendar por uso (urbano, estrada ou trilha), por faixa de preco e por categoria. Exemplos: "me ajuda a escolher uma bike", "quais itens tem", "capacete ate 120", "itens para trilha".';
  }

  if (wantsCatalog) {
    const topCatalog = products
      .filter((product) => product.inStock)
      .slice(0, 6)
      .map((product) => ({
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category,
        brand: product.brand,
        description: product.description,
        score: 1,
        path: `/products/${product.id}`,
      }));

    return `Temos itens em bicicletas, capacetes, vestuario e acessorios. Aqui vai uma amostra rapida:\n${formatProductList(
      topCatalog
    )}\n\nSe quiser, eu filtro agora por categoria, uso ou faixa de preco.`;
  }

  if (intent === 'shipping') {
    return 'Claro. O frete e calculado no carrinho com base no valor total e no endereco. Se quiser, eu posso te indicar produtos e voce finaliza a compra em seguida.';
  }

  if (intent === 'payment') {
    return 'Perfeito. Atualmente voce pode concluir com cartao, MB WAY, multibanco e outras opcoes exibidas no checkout. Posso te sugerir itens para seguir para compra.';
  }

  if (wantsHelp && productsRanked.length === 0) {
    return 'Estou aqui para te ajudar na compra. Me diga seu objetivo (estrada, trilha, urbano), seu nivel e faixa de preco. Com isso eu monto uma recomendacao certeira. Se preferir, comece com: "quais itens tem".';
  }

  if (productsRanked.length > 0) {
    const opening =
      intent === 'recommendation'
        ? 'Com base no que voce pediu, estas opcoes fazem sentido:'
        : 'Encontrei produtos bem alinhados ao seu pedido:';

    const closing =
      intent === 'checkout'
        ? 'Se quiser, clique no item ideal e finalize a compra no carrinho.'
        : 'Se quiser, eu comparo para voce por custo-beneficio, desempenho e uso.';

    return `${opening}\n${formatProductList(productsRanked)}\n\n${closing}`;
  }

  return 'Nao achei um item exato ainda, mas consigo te guiar. Me diga categoria (bicicleta, capacete, roupa, acessorio), faixa de preco e tipo de uso.';
}

function isGenericFollowUp(normalizedQuery: string): boolean {
  return hasPhrase(normalizedQuery, [
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

function buildContextualQuery(query: string, recentUserMessages: string[]): string {
  const normalized = normalize(query);
  if (recentUserMessages.length === 0) {
    return query;
  }

  const hasBudgetOnly = /\b(ate|até|max|maximo|máximo)\b/.test(normalized) && /\d/.test(normalized);
  const genericFollowUp = isGenericFollowUp(normalized);

  if (!hasBudgetOnly && !genericFollowUp) {
    return query;
  }

  const lastInformative = [...recentUserMessages]
    .reverse()
    .map((message) => message.trim())
    .find((message) => {
      const normalizedMessage = normalize(message);
      return normalizedMessage.length >= 8 && !isGenericFollowUp(normalizedMessage);
    });

  if (!lastInformative) {
    return query;
  }

  return `${lastInformative} ${query}`;
}

export function askLocalRag(query: string, context: LocalRagContext = {}): LocalRagResponse {
  const contextualQuery = buildContextualQuery(query, context.recentUserMessages || []);
  const ranked = rankProducts(contextualQuery);
  const message = buildNaturalAnswer(contextualQuery, ranked);
  return {
    message,
    products: ranked,
  };
}
