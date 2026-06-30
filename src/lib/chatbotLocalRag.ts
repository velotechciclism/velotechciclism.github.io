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
  trilha: ['mtb', 'montanha', 'offroad', 'suspensao'],
  estrada: ['speed', 'road', 'asfalto', 'aero'],
  tamanho: ['medida', 'quadro', 'aro', 'ajuste', 'fit'],
  manutencao: ['revisao', 'limpeza', 'lubrificacao', 'corrente', 'freio'],
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
  maintenance: ['manutencao', 'revisao', 'limpar', 'limpeza', 'lubrificar', 'corrente', 'freio'],
  sizing: ['tamanho', 'medida', 'quadro', 'aro', 'altura', 'fit', 'vestir'],
  safety: ['seguranca', 'capacete', 'luz', 'refletivo', 'protecao'],
  returns: ['troca', 'devolucao', 'devolver', 'garantia', 'reembolso'],
  comparison: ['comparar', 'comparacao', 'versus', 'diferenca', 'melhor'],
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
  const normalized = normalize(query);
  if (!/(€|eur|euro|preco|orcamento|ate|menos de|maximo|gastar|custa)/i.test(query) &&
      !hasPhrase(normalized, ['por menos', 'mais barato'])) {
    return null;
  }
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
    return 'Claro. Posso te atender por suporte direto tambem: WhatsApp +351 966 601 839, e-mail c.eduardoteixeiraguinsber@gmail.com e telefone +351 966 601 839. Se preferir, eu continuo por aqui com recomendacoes.';
  }

  if (wantsGreeting && productsRanked.length === 0) {
    return 'Oi! Estou aqui para ajudar voce a encontrar o produto certo. Posso recomendar por uso (urbano, estrada ou trilha), por faixa de preco e por categoria. Exemplos: "me ajuda a escolher uma bicicleta", "quais itens tem", "luvas ate 20", "itens para trilha".';
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

    return `Temos itens em bicicletas, roupas e calcados e acessorios. Aqui vai uma amostra rapida:\n${formatProductList(
      topCatalog
    )}\n\nSe quiser, eu filtro agora por categoria, uso ou faixa de preco.`;
  }

  if (intent === 'shipping') {
    return 'Claro. O frete e calculado no carrinho com base no valor total e no endereco. Se quiser, eu posso te indicar produtos e voce finaliza a compra em seguida.';
  }

  if (intent === 'payment') {
    return 'Perfeito. Atualmente voce pode concluir com cartao, MB WAY, multibanco e outras opcoes exibidas na finalizacao da compra. Posso te sugerir itens para seguir para compra.';
  }

  if (intent === 'maintenance') {
    return 'Para manter a bicicleta confiavel: confira pressao e freios antes de cada saida; limpe e lubrifique a corrente quando estiver seca ou ruidosa; verifique desgaste de pneus e pastilhas mensalmente; e faca revisao de apertos e transmissao a cada 3 a 6 meses, conforme uso. Nao aplique oleo nos discos de freio. Diga o componente ou sintoma e eu detalho o procedimento.';
  }

  if (intent === 'sizing') {
    return 'O tamanho correto depende da sua altura, medida do cavalo e geometria do fabricante — aro 29 nao significa tamanho do quadro. Para bicicleta, envie altura e cavalo em centimetros e o tipo de uso. Para roupa, informe peito, cintura e quadril; compare sempre com a tabela da marca e prefira o tamanho maior se ficar entre dois.';
  }

  if (intent === 'safety') {
    return 'Priorize capacete bem ajustado e certificado, luz branca dianteira e vermelha traseira, itens refletivos e pneus/freios em bom estado. Para pedalar a noite ou no transito, visibilidade vem antes de desempenho. Posso montar um kit por orcamento e tipo de percurso.';
  }

  if (intent === 'returns') {
    return 'Para troca, devolucao ou garantia, conserve embalagem, comprovante e fotos do estado do produto. As condicoes e prazos aplicaveis devem ser confirmados na pagina de termos ou com o atendimento antes do envio; eu nao vou inventar um prazo que nao esteja publicado.';
  }

  if (intent === 'comparison' && productsRanked.length > 1) {
    const [first, second] = productsRanked;
    const priceDifference = Math.abs(first.price - second.price);
    const cheaper = first.price <= second.price ? first : second;
    return `Comparacao rapida:\n- [${first.name}](${first.path}): ${first.category}, EUR ${first.price.toFixed(2)}.\n- [${second.name}](${second.path}): ${second.category}, EUR ${second.price.toFixed(2)}.\n\n${cheaper.name} custa EUR ${priceDifference.toFixed(2)} menos. Para dizer qual e melhor para voce, preciso do tipo de uso, nivel e prioridade (preco, conforto ou desempenho).`;
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

  return 'Nao achei um item exato ainda, mas consigo te guiar. Me diga categoria (bicicleta, roupa, calcado ou acessorio), faixa de preco e tipo de uso.';
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
