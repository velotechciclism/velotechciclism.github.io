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
  help: ['ajuda', 'help', 'suporte', 'como', 'funciona', 'orienta'],
  shipping: ['frete', 'envio', 'entrega', 'shipping', 'prazo'],
  payment: ['pagamento', 'cartao', 'mb way', 'multibanco', 'paypal', 'pix'],
  recommendation: ['recomenda', 'sugere', 'ideal', 'indica', 'melhor', 'quero'],
  checkout: ['comprar', 'compra', 'checkout', 'finalizar', 'pedido', 'carrinho'],
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
    .filter((token) => token.length > 1);
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
  const matches = query.match(/(\d+[\.,]?\d*)/g);
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
  const expandedTokens = expandTokens(tokenize(query));
  const intent = detectIntent(expandedTokens);

  if (intent === 'shipping') {
    return 'Claro. O frete e calculado no carrinho com base no valor total e no endereco. Se quiser, eu posso te indicar produtos e voce finaliza a compra em seguida.';
  }

  if (intent === 'payment') {
    return 'Perfeito. Atualmente voce pode concluir com cartao, MB WAY, multibanco e outras opcoes exibidas no checkout. Posso te sugerir itens para seguir para compra.';
  }

  if (intent === 'help' && productsRanked.length === 0) {
    return 'Estou aqui para te ajudar na compra. Me diga seu objetivo (estrada, trilha, urbano), seu nivel e faixa de preco. Com isso eu monto uma recomendacao certeira.';
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

export function askLocalRag(query: string): LocalRagResponse {
  const ranked = rankProducts(query);
  const message = buildNaturalAnswer(query, ranked);
  return {
    message,
    products: ranked,
  };
}
