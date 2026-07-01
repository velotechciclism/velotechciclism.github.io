import { getCatalogProducts } from './localCatalog';

type RagProduct = {
  id: string;
  name: string;
  price: number;
  category: string;
  brand: string;
  description: string;
  score: number;
  path: string;
  reasons: string[];
};

export type LocalRagResponse = {
  message: string;
  products: RagProduct[];
};

type LocalRagContext = {
  recentUserMessages?: string[];
};

type Intent =
  | 'greeting'
  | 'help'
  | 'catalog'
  | 'support'
  | 'shipping'
  | 'payment'
  | 'recommendation'
  | 'checkout'
  | 'maintenance'
  | 'sizing'
  | 'safety'
  | 'returns'
  | 'comparison'
  | 'availability'
  | 'gift'
  | 'beginner'
  | 'urgency';

type ShopperProfile = {
  budget: number | null;
  minBudget: number | null;
  intents: Intent[];
  categories: string[];
  uses: string[];
  levels: string[];
  audiences: string[];
  priorities: string[];
  brands: string[];
  sizes: string[];
  colors: string[];
  wantsCheap: boolean;
  wantsPremium: boolean;
  wantsInStock: boolean;
};

const synonymMap: Record<string, string[]> = {
  bike: ['bicicleta', 'bici', 'magrela', 'ciclo', 'speed', 'road', 'mtb', 'mountain', 'gravel', 'urbana'],
  bicicleta: ['bike', 'bici', 'magrela', 'ciclo', 'speed', 'road', 'mtb', 'mountain', 'gravel', 'urbana'],
  bici: ['bicicleta', 'bike'],
  mtb: ['montanha', 'mountain', 'trilha', 'trail', 'offroad', 'xc', 'terra'],
  montanha: ['mtb', 'mountain', 'trilha', 'offroad', 'terra', 'xc'],
  trilha: ['mtb', 'montanha', 'offroad', 'terra', 'lama', 'xc', 'suspensao'],
  estrada: ['speed', 'road', 'asfalto', 'aero', 'performance', 'velocidade'],
  speed: ['estrada', 'road', 'asfalto', 'velocidade'],
  urbano: ['cidade', 'commute', 'deslocamento', 'dia a dia', 'conforto'],
  infantil: ['crianca', 'criança', 'junior', 'kids', 'menino', 'menina'],
  capacete: ['helmet', 'seguranca', 'mips', 'protecao', 'casco'],
  helmet: ['capacete', 'seguranca', 'protecao'],
  luva: ['glove', 'gloves', 'acessorio', 'pegada', 'mao', 'maos', 'conforto'],
  luvas: ['luva', 'glove', 'gloves', 'pegada', 'mao', 'maos'],
  camisa: ['jersey', 'camisola', 'roupa', 'vestuario', 'apparel', 'ciclismo'],
  jersey: ['camisa', 'camisola', 'roupa', 'vestuario'],
  bretelle: ['bermuda', 'short', 'calçao', 'calcao', 'roupa', 'conforto'],
  bermuda: ['bretelle', 'short', 'calçao', 'calcao', 'roupa'],
  macaquinho: ['roupa', 'conjunto', 'ciclismo', 'performance'],
  roupa: ['vestuario', 'apparel', 'camisa', 'bermuda', 'bretelle', 'macaquinho'],
  acessorio: ['acessorio', 'luva', 'capacete', 'equipamento', 'item'],
  comprar: ['compra', 'checkout', 'pedido', 'carrinho', 'finalizar', 'levar', 'adquirir'],
  carrinho: ['comprar', 'checkout', 'pedido', 'finalizar'],
  barato: ['economico', 'preco', 'custo', 'desconto', 'promocao', 'oferta', 'baixo custo'],
  economico: ['barato', 'custo beneficio', 'preco', 'desconto'],
  premium: ['caro', 'top', 'alto desempenho', 'profissional', 'melhor', 'avancado'],
  frete: ['envio', 'entrega', 'shipping', 'prazo', 'transportadora'],
  pagamento: ['cartao', 'mb way', 'multibanco', 'paypal', 'pix', 'visa', 'mastercard', 'apple pay', 'google pay'],
  tamanho: ['medida', 'quadro', 'aro', 'altura', 'fit', 'vestir', 'numero'],
  manutencao: ['revisao', 'limpeza', 'lubrificacao', 'corrente', 'freio', 'travao', 'pastilha'],
  iniciante: ['comecando', 'começando', 'primeira', 'basico', 'facil', 'entrada', 'novato'],
  presente: ['gift', 'oferta', 'dar', 'aniversario', 'surpresa'],
};

const intentLexicon: Record<Intent, string[]> = {
  greeting: ['oi', 'ola', 'hello', 'eae', 'salve', 'bom', 'boa', 'hey'],
  help: ['ajuda', 'help', 'suporte', 'como', 'funciona', 'orienta', 'duvida', 'dúvida'],
  catalog: ['itens', 'item', 'catalogo', 'produtos', 'quais', 'tem', 'mostrar', 'lista', 'opcoes', 'opções'],
  support: ['atendimento', 'suporte', 'contato', 'whatsapp', 'email', 'telefone', 'humano', 'falar'],
  shipping: ['frete', 'envio', 'entrega', 'shipping', 'prazo', 'chega', 'receber'],
  payment: ['pagamento', 'cartao', 'mb way', 'multibanco', 'paypal', 'pix', 'visa', 'mastercard', 'parcelar'],
  recommendation: ['recomenda', 'sugere', 'ideal', 'indica', 'melhor', 'quero', 'preciso', 'procuro', 'escolher'],
  checkout: ['comprar', 'compra', 'checkout', 'finalizar', 'pedido', 'carrinho', 'levar', 'adicionar'],
  maintenance: ['manutencao', 'revisao', 'limpar', 'limpeza', 'lubrificar', 'corrente', 'freio', 'travao'],
  sizing: ['tamanho', 'medida', 'quadro', 'aro', 'altura', 'fit', 'vestir', 'numero', 'idade'],
  safety: ['seguranca', 'capacete', 'luz', 'refletivo', 'protecao', 'visibilidade'],
  returns: ['troca', 'devolucao', 'devolver', 'garantia', 'reembolso', 'defeito'],
  comparison: ['comparar', 'comparacao', 'versus', 'vs', 'diferenca', 'melhor', 'qual escolher'],
  availability: ['stock', 'estoque', 'disponivel', 'disponível', 'tem agora', 'pronta entrega'],
  gift: ['presente', 'aniversario', 'oferta', 'surpresa', 'dar para'],
  beginner: ['iniciante', 'comecando', 'começando', 'primeira bike', 'primeira bicicleta', 'novato'],
  urgency: ['hoje', 'rapido', 'rápido', 'urgente', 'agora', 'imediato'],
};

const profileLexicons = {
  categories: {
    Bicicletas: ['bicicleta', 'bike', 'bici', 'mtb', 'montanha', 'speed', 'estrada', 'aro', 'quadro', 'infantil'],
    Acessórios: ['acessorio', 'acessorios', 'capacete', 'luva', 'luvas', 'equipamento', 'seguranca', 'protecao'],
    'Roupas e Calçados': ['roupa', 'vestuario', 'camisa', 'jersey', 'bermuda', 'bretelle', 'macaquinho', 'calçao', 'calcao'],
  },
  uses: {
    trilha: ['trilha', 'mtb', 'montanha', 'offroad', 'terra', 'lama', 'xc', 'suspensao'],
    estrada: ['estrada', 'speed', 'road', 'asfalto', 'aero', 'velocidade'],
    urbano: ['urbano', 'cidade', 'rua', 'dia a dia', 'deslocamento', 'trabalho', 'commute'],
    infantil: ['infantil', 'crianca', 'criança', 'kids', 'junior', 'menino', 'menina', 'anos'],
    treino: ['treino', 'pedal', 'academia', 'resistencia', 'longao', 'longão', 'performance'],
    chuva: ['chuva', 'vento', 'frio', 'inverno', 'corta vento'],
  },
  levels: {
    iniciante: ['iniciante', 'comecando', 'começando', 'primeira', 'entrada', 'basico', 'facil', 'novato'],
    intermediario: ['intermediario', 'intermediário', 'evoluir', 'melhorar', 'regular'],
    avancado: ['avancado', 'avançado', 'profissional', 'competicao', 'competição', 'pro', 'performance'],
  },
  audiences: {
    adulto: ['adulto', 'homem', 'mulher', 'masculino', 'feminino'],
    crianca: ['crianca', 'criança', 'infantil', 'menino', 'menina', 'junior', 'anos'],
  },
  priorities: {
    conforto: ['conforto', 'confortavel', 'confortável', 'leve', 'ajuste', 'macio'],
    desempenho: ['desempenho', 'performance', 'rapido', 'rápido', 'velocidade', 'aero', 'pro'],
    seguranca: ['seguranca', 'segurança', 'protecao', 'proteção', 'visibilidade', 'capacete', 'refletivo'],
    custoBeneficio: ['custo beneficio', 'custo-beneficio', 'custo benefício', 'barato', 'economico', 'econômico'],
    resistencia: ['resistente', 'duravel', 'durável', 'reforcado', 'reforçado', 'robusto'],
  },
  colors: {
    preto: ['preto', 'black'],
    branco: ['branco', 'white'],
    vermelho: ['vermelho', 'red'],
    azul: ['azul', 'blue'],
    verde: ['verde', 'green'],
    amarelo: ['amarelo', 'neon', 'yellow'],
    cinzento: ['cinzento', 'cinza', 'gray', 'grey'],
    castanho: ['castanho', 'marrom', 'brown'],
  },
};

const typoMap: Record<string, string> = {
  oiie: 'oi',
  oii: 'oi',
  olaa: 'ola',
  ajdua: 'ajuda',
  ajuada: 'ajuda',
  palavreas: 'palavras',
  bicileta: 'bicicleta',
  bicicletaa: 'bicicleta',
  capacetee: 'capacete',
  luvas: 'luva',
  luvaa: 'luva',
  cartaoo: 'cartao',
  precco: 'preco',
  presiso: 'preciso',
  presciso: 'preciso',
  comprarrr: 'comprar',
  trilhaa: 'trilha',
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
  return phrases.some((phrase) => query.includes(normalize(phrase)));
}

function expandTokens(tokens: string[]): string[] {
  const expanded = new Set<string>(tokens);

  for (const token of tokens) {
    for (const synonym of synonymMap[token] || []) {
      for (const synonymToken of tokenize(synonym)) {
        expanded.add(synonymToken);
      }
    }
  }

  return [...expanded];
}

function detectBudget(query: string): { max: number | null; min: number | null } {
  const normalized = normalize(query);
  const values = [...query.matchAll(/(?:€|eur|euro)?\s*(\d+[.,]?\d*)/gi)]
    .map((match) => Number(match[1].replace(',', '.')))
    .filter((value) => Number.isFinite(value));

  if (values.length === 0) {
    return { max: null, min: null };
  }

  const mentionsBudget = /€|eur|euro|preco|preço|orcamento|orçamento|ate|até|menos de|maximo|máximo|gastar|custa|barato|economico|promo/.test(normalized);

  if (!mentionsBudget) {
    return { max: null, min: null };
  }

  if (hasPhrase(normalized, ['entre']) && values.length >= 2) {
    return { min: Math.min(values[0], values[1]), max: Math.max(values[0], values[1]) };
  }

  if (hasPhrase(normalized, ['acima de', 'mais de', 'a partir de'])) {
    return { min: values[0], max: null };
  }

  return { max: Math.max(...values), min: null };
}

function detectIntents(expandedTokens: string[], normalizedQuery: string): Intent[] {
  const scores = Object.entries(intentLexicon).map(([intent, words]) => {
    const score = words.reduce((sum, word) => {
      const normalizedWord = normalize(word);
      return expandedTokens.includes(normalizedWord) || normalizedQuery.includes(normalizedWord)
        ? sum + 1
        : sum;
    }, 0);
    return { intent: intent as Intent, score };
  });

  return scores
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.intent);
}

function detectFromLexicon<T extends string>(normalizedQuery: string, lexicon: Record<T, string[]>): T[] {
  return (Object.entries(lexicon) as Array<[T, string[]]>)
    .filter(([, words]) => words.some((word) => normalizedQuery.includes(normalize(String(word)))))
    .map(([key]) => key as T);
}

function detectSizes(normalizedQuery: string): string[] {
  const sizes = new Set<string>();
  for (const match of normalizedQuery.matchAll(/\b(xs|s|m|l|xl|xxl|20|24|26|27 5|29)\b/g)) {
    sizes.add(match[1]);
  }

  for (const match of normalizedQuery.matchAll(/\b(\d{2,3})\s*(cm|centimetros|anos|polegadas)?\b/g)) {
    sizes.add(match[1]);
  }

  return [...sizes];
}

function detectBrands(normalizedQuery: string): string[] {
  const brands = new Set<string>();
  for (const product of getCatalogProducts({ includeHidden: true })) {
    const normalizedBrand = normalize(product.brand);
    if (normalizedBrand && normalizedQuery.includes(normalizedBrand)) {
      brands.add(product.brand);
    }
  }

  return [...brands];
}

function buildShopperProfile(query: string): ShopperProfile {
  const normalizedQuery = normalize(query);
  const tokens = tokenize(normalizedQuery);
  const expandedTokens = expandTokens(tokens);
  const budget = detectBudget(query);
  const intents = detectIntents(expandedTokens, normalizedQuery);

  return {
    budget: budget.max,
    minBudget: budget.min,
    intents,
    categories: detectFromLexicon(normalizedQuery, profileLexicons.categories),
    uses: detectFromLexicon(normalizedQuery, profileLexicons.uses),
    levels: detectFromLexicon(normalizedQuery, profileLexicons.levels),
    audiences: detectFromLexicon(normalizedQuery, profileLexicons.audiences),
    priorities: detectFromLexicon(normalizedQuery, profileLexicons.priorities),
    brands: detectBrands(normalizedQuery),
    sizes: detectSizes(normalizedQuery),
    colors: detectFromLexicon(normalizedQuery, profileLexicons.colors),
    wantsCheap: hasPhrase(normalizedQuery, ['barato', 'economico', 'baixo custo', 'custo beneficio', 'promo', 'desconto']),
    wantsPremium: hasPhrase(normalizedQuery, ['premium', 'melhor', 'top', 'profissional', 'alto desempenho', 'pro']),
    wantsInStock: hasPhrase(normalizedQuery, ['stock', 'estoque', 'disponivel', 'pronta entrega', 'tem agora']),
  };
}

function scoreTextAgainstWords(doc: string, words: string[]): number {
  return words.reduce((score, word) => {
    const normalizedWords = tokenize(word);
    return score + normalizedWords.reduce((inner, token) => (doc.includes(token) ? inner + 1 : inner), 0);
  }, 0);
}

function rankProducts(query: string, profile = buildShopperProfile(query)): RagProduct[] {
  const baseTokens = tokenize(query);
  const expandedTokens = expandTokens(baseTokens);
  const catalogProducts = getCatalogProducts();

  return catalogProducts
    .map((product) => {
      const specsText = product.specs ? Object.values(product.specs).join(' ') : '';
      const doc = normalize(`${product.name} ${product.description} ${product.category} ${product.brand} ${specsText}`);
      const reasons: string[] = [];

      let score = expandedTokens.reduce((sum, token) => (doc.includes(token) ? sum + 1.2 : sum), 0);

      if (profile.categories.includes(product.category)) {
        score += 5;
        reasons.push(`categoria ${product.category}`);
      }

      if (profile.brands.some((brand) => normalize(brand) === normalize(product.brand))) {
        score += 4;
        reasons.push(`marca ${product.brand}`);
      }

      for (const use of profile.uses) {
        const useScore = scoreTextAgainstWords(doc, profileLexicons.uses[use as keyof typeof profileLexicons.uses] || []);
        if (useScore > 0) {
          score += 3 + useScore;
          reasons.push(`uso ${use}`);
        }
      }

      for (const priority of profile.priorities) {
        const priorityScore = scoreTextAgainstWords(doc, profileLexicons.priorities[priority as keyof typeof profileLexicons.priorities] || []);
        if (priorityScore > 0) {
          score += 2 + priorityScore;
          reasons.push(priority === 'custoBeneficio' ? 'bom custo-beneficio' : `foco em ${priority}`);
        }
      }

      if (profile.sizes.some((size) => doc.includes(normalize(size)))) {
        score += 2.5;
        reasons.push('tamanho/aro compatível');
      }

      if (profile.colors.some((color) => doc.includes(normalize(color)))) {
        score += 1.5;
        reasons.push('cor alinhada');
      }

      if (profile.budget && product.price <= profile.budget) {
        score += 4;
        reasons.push(`dentro do orçamento de EUR ${profile.budget.toFixed(2)}`);
      } else if (profile.budget && product.price <= profile.budget * 1.15) {
        score += 1;
        reasons.push('um pouco acima do orçamento');
      } else if (profile.budget && product.price > profile.budget * 1.15) {
        score -= 4;
      }

      if (profile.minBudget && product.price >= profile.minBudget) {
        score += 1;
      }

      if (profile.wantsCheap) {
        score += Math.max(0, 3 - product.price / 140);
      }

      if (profile.wantsPremium && product.price >= 250) {
        score += 2;
        reasons.push('opção mais premium');
      }

      if (profile.levels.includes('iniciante') && product.price <= 300) {
        score += 2;
        reasons.push('boa entrada para iniciante');
      }

      if (profile.intents.includes('gift') && product.price <= 150) {
        score += 1.5;
        reasons.push('boa faixa para presente');
      }

      if (product.isFeatured) score += 0.75;
      if (product.isNew) score += 0.35;
      if (product.rating >= 4.6) score += 0.5;

      if (product.inStock) {
        score += profile.wantsInStock ? 2 : 0.75;
        reasons.push('disponível em stock');
      } else {
        score -= 6;
      }

      return {
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category,
        brand: product.brand,
        description: product.description,
        path: `/products/${product.id}`,
        score,
        reasons: [...new Set(reasons)].slice(0, 3),
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.price - b.price)
    .slice(0, 4);
}

function formatProductList(items: RagProduct[], withReasons = true): string {
  return items
    .map((item, index) => {
      const reasonText = withReasons && item.reasons.length > 0 ? ` - ${item.reasons.join(', ')}` : '';
      return `${index + 1}. [${item.name}](${item.path}) (${item.category}) por EUR ${item.price.toFixed(2)}${reasonText}`;
    })
    .join('\n');
}

function summarizeProfile(profile: ShopperProfile): string {
  const parts = [
    profile.categories.length ? `categoria: ${profile.categories.join(', ')}` : '',
    profile.uses.length ? `uso: ${profile.uses.join(', ')}` : '',
    profile.budget ? `orçamento: até EUR ${profile.budget.toFixed(2)}` : '',
    profile.priorities.length ? `prioridade: ${profile.priorities.join(', ')}` : '',
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(' | ') : 'objetivo ainda aberto';
}

function buildBuyingClose(intent: Intent | undefined, productsRanked: RagProduct[]): string {
  if (productsRanked.length === 0) {
    return 'Me diga o tipo de pedal, orçamento e se é para adulto ou criança que eu afino a busca.';
  }

  const [best] = productsRanked;

  if (intent === 'checkout') {
    return `Minha sugestão direta é abrir [${best.name}](${best.path}), conferir quantidade e adicionar ao carrinho. Depois é só finalizar com o método de pagamento simulado.`;
  }

  return `Para comprar, abra a melhor opção, selecione a quantidade permitida e use o botão de carrinho. Se quiser, eu também comparo as duas primeiras opções.`;
}

function buildNaturalAnswer(query: string, productsRanked: RagProduct[], profile: ShopperProfile): string {
  const normalizedQuery = normalize(query);
  const mainIntent = profile.intents[0];

  const wantsCatalog =
    profile.intents.includes('catalog') ||
    hasPhrase(normalizedQuery, ['quais itens tem', 'quais produtos tem', 'o que voces tem', 'oque voces tem', 'mostrar itens']);

  const wantsGreeting =
    profile.intents.includes('greeting') ||
    hasPhrase(normalizedQuery, ['oi', 'ola', 'bom dia', 'boa tarde', 'boa noite']);

  const wantsHelp = profile.intents.includes('help') || hasPhrase(normalizedQuery, ['me ajuda', 'me ajude']);

  if (profile.intents.includes('support')) {
    return 'Claro. Posso te atender por suporte direto também: WhatsApp +351 966 601 839, e-mail c.eduardoteixeiraguinsber@gmail.com e telefone +351 966 601 839. Por aqui, eu consigo recomendar produto, comparar opções e guiar até o carrinho.';
  }

  if (wantsGreeting && productsRanked.length === 0) {
    return 'Oi! Sou o assistente de compra da VeloTech. Posso encontrar o melhor produto por uso, orçamento, tamanho, marca e nível. Exemplos: "bike para trilha até 300", "luvas baratas", "roupa para treino", "presente para criança de 8 anos".';
  }

  if (wantsCatalog) {
    const topCatalog = getCatalogProducts()
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
        reasons: ['disponível em stock'],
        path: `/products/${product.id}`,
      }));

    return `Temos bicicletas, roupas/calçados e acessórios. Aqui vai uma amostra disponível agora:\n${formatProductList(topCatalog, false)}\n\nSe me disser uso e orçamento, eu separo as melhores opções para comprar.`;
  }

  if (profile.intents.includes('shipping')) {
    return 'O frete é simulado no carrinho e pode ficar grátis conforme o total da compra. Para acelerar, eu posso indicar produtos em stock e você já segue para o carrinho.';
  }

  if (profile.intents.includes('payment')) {
    return 'Na finalização simulada aparecem opções como cartão, MB WAY, multibanco, PayPal, Apple Pay e Google Pay. Não há cobrança real; é uma demonstração completa de compra.';
  }

  if (profile.intents.includes('maintenance')) {
    return 'Para manter a bicicleta confiável: calibre pneus antes do pedal, confira freios, limpe e lubrifique a corrente quando estiver seca ou ruidosa, e revise transmissão/fixações a cada 3 a 6 meses. Se quiser comprar algo para manutenção, diga o componente.';
  }

  if (profile.intents.includes('sizing')) {
    return 'Para acertar tamanho: em bicicleta, informe altura, cavalo em cm e tipo de uso; aro não é a mesma coisa que tamanho do quadro. Em roupa, informe peito, cintura e quadril. Se ficar entre dois tamanhos, normalmente é mais seguro subir um tamanho.';
  }

  if (profile.intents.includes('safety')) {
    return 'Para segurança, priorize capacete bem ajustado, luvas para controle, luzes e itens refletivos. Se você pedala na rua ou à noite, visibilidade e proteção vêm antes de desempenho.';
  }

  if (profile.intents.includes('returns')) {
    return 'Para troca, devolução ou garantia, mantenha comprovante, embalagem e fotos do produto. Como este projeto é demonstrativo, confirme as regras publicadas nos termos antes de simular o envio.';
  }

  if (profile.intents.includes('comparison') && productsRanked.length > 1) {
    const [first, second] = productsRanked;
    const cheaper = first.price <= second.price ? first : second;
    const premium = first.price > second.price ? first : second;
    return `Comparação rápida:\n- [${first.name}](${first.path}): EUR ${first.price.toFixed(2)}; ${first.reasons.join(', ') || 'boa aderência ao pedido'}.\n- [${second.name}](${second.path}): EUR ${second.price.toFixed(2)}; ${second.reasons.join(', ') || 'alternativa próxima'}.\n\nEscolha ${cheaper.name} se prioridade for preço. Escolha ${premium.name} se quiser investir mais em desempenho/versatilidade.`;
  }

  if (productsRanked.length > 0) {
    const opening =
      profile.intents.includes('recommendation') || wantsHelp
        ? `Analisei seu pedido (${summarizeProfile(profile)}). Estas opções fazem mais sentido:`
        : 'Encontrei produtos alinhados ao que você pediu:';

    return `${opening}\n${formatProductList(productsRanked)}\n\n${buildBuyingClose(mainIntent, productsRanked)}`;
  }

  return 'Ainda não encontrei um item exato. Para eu recomendar melhor, me diga: categoria (bicicleta, roupa ou acessório), orçamento aproximado, tipo de uso e se é adulto ou criança.';
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
    'qual desses',
    'e esse',
    'mais barato',
    'melhor deles',
  ]);
}

function buildContextualQuery(query: string, recentUserMessages: string[]): string {
  const normalized = normalize(query);
  if (recentUserMessages.length === 0) {
    return query;
  }

  const hasBudgetOnly = /\b(ate|até|max|maximo|máximo|menos de|abaixo de)\b/.test(normalized) && /\d/.test(normalized);
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
  const profile = buildShopperProfile(contextualQuery);
  const ranked = rankProducts(contextualQuery, profile);
  const message = buildNaturalAnswer(contextualQuery, ranked, profile);

  return {
    message,
    products: ranked,
  };
}
