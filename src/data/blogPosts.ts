export type BlogLanguage = 'pt-br' | 'en';

export type BlogPostContent = {
  title: string;
  excerpt: string;
  category: string;
  date: string;
  intro: string;
  sections: Array<{
    heading: string;
    body: string;
  }>;
};

export type BlogPost = {
  id: string;
  author: string;
  marker: string;
  tags: string[];
  content: Record<BlogLanguage, BlogPostContent>;
};

export const blogPosts: BlogPost[] = [
  {
    id: 'maintenance',
    author: 'Alex Johnson',
    marker: '01',
    tags: ['maintenance', 'beginners', 'workshop'],
    content: {
      'pt-br': {
        title: 'Dicas essenciais de manutencao para iniciantes',
        excerpt: 'Aprenda as rotinas basicas para manter sua bicicleta confiavel, limpa e pronta para o proximo pedal.',
        category: 'Manutencao',
        date: '12 de Janeiro, 2026',
        intro:
          'Uma bicicleta bem cuidada roda melhor, dura mais e evita sustos no meio do caminho. O segredo e transformar pequenos cuidados em rotina.',
        sections: [
          {
            heading: 'Comece pela limpeza certa',
            body:
              'Use pano macio, escova pequena e desengraxante na transmissao. Evite jatos fortes diretamente em rolamentos, cubos e movimento central.',
          },
          {
            heading: 'Lubrifique com criterio',
            body:
              'A corrente deve ficar lubrificada, mas nao encharcada. Depois de aplicar o lubrificante, gire os pedais e remova o excesso com um pano seco.',
          },
          {
            heading: 'Cheque antes de sair',
            body:
              'Pressao dos pneus, freios, aperto das rodas e funcionamento das marchas resolvem a maioria dos problemas antes de eles aparecerem na rua.',
          },
        ],
      },
      en: {
        title: 'Essential bike maintenance tips for beginners',
        excerpt: 'Learn the basic routines that keep your bike reliable, clean, and ready for the next ride.',
        category: 'Maintenance',
        date: 'January 12, 2026',
        intro:
          'A well maintained bike rides better, lasts longer, and keeps surprises away from your route. The trick is turning small checks into a habit.',
        sections: [
          {
            heading: 'Start with proper cleaning',
            body:
              'Use a soft cloth, a small brush, and drivetrain degreaser. Avoid strong water jets around bearings, hubs, and the bottom bracket.',
          },
          {
            heading: 'Lubricate with intent',
            body:
              'The chain should be lubricated, not soaked. Apply lube, spin the cranks, and wipe away the excess with a dry cloth.',
          },
          {
            heading: 'Check before you roll',
            body:
              'Tire pressure, brakes, wheel tightness, and shifting cover most problems before they show up on the road.',
          },
        ],
      },
    },
  },
  {
    id: 'helmet-guide',
    author: 'Sarah Cooper',
    marker: '02',
    tags: ['safety', 'helmet', 'fit'],
    content: {
      'pt-br': {
        title: 'Escolhendo o capacete certo: guia completo',
        excerpt: 'Seguranca em primeiro lugar: veja como escolher um capacete confortavel, ventilado e adequado ao seu uso.',
        category: 'Seguranca',
        date: '10 de Janeiro, 2026',
        intro:
          'O melhor capacete e aquele que voce usa em todos os pedais. Ajuste, certificacao e conforto contam tanto quanto o estilo.',
        sections: [
          {
            heading: 'Priorize certificacao',
            body:
              'Procure modelos com certificacoes reconhecidas e boa cobertura lateral. Tecnologias de protecao rotacional tambem sao bem-vindas.',
          },
          {
            heading: 'Ajuste sem pontos de pressao',
            body:
              'O capacete deve ficar firme sem apertar. A cinta precisa formar um V abaixo das orelhas e permitir abrir a boca confortavelmente.',
          },
          {
            heading: 'Escolha pelo uso',
            body:
              'Estrada pede leveza e ventilacao. Trilha pede cobertura maior. Uso urbano valoriza visibilidade e praticidade.',
          },
        ],
      },
      en: {
        title: 'Choosing the right helmet: a complete guide',
        excerpt: 'Safety first: learn how to pick a helmet that fits well, breathes well, and matches your riding style.',
        category: 'Safety',
        date: 'January 10, 2026',
        intro:
          'The best helmet is the one you wear on every ride. Fit, certification, and comfort matter as much as style.',
        sections: [
          {
            heading: 'Prioritize certification',
            body:
              'Look for recognized certifications and solid side coverage. Rotational impact protection is also a strong plus.',
          },
          {
            heading: 'Fit without pressure points',
            body:
              'The helmet should feel secure without pinching. Straps should form a V below the ears and let you open your mouth comfortably.',
          },
          {
            heading: 'Match it to your use',
            body:
              'Road riding favors lightness and ventilation. Trail riding favors deeper coverage. Urban use values visibility and convenience.',
          },
        ],
      },
    },
  },
  {
    id: 'mtb-trails',
    author: 'Mike Wilson',
    marker: '03',
    tags: ['mtb', 'trail', 'adventure'],
    content: {
      'pt-br': {
        title: 'Trilhas de mountain bike: melhores destinos',
        excerpt: 'Conheca criterios para escolher trilhas seguras, divertidas e coerentes com seu nivel tecnico.',
        category: 'Aventura',
        date: '8 de Janeiro, 2026',
        intro:
          'Uma boa trilha combina terreno, visual e desafio na medida certa. Escolher bem deixa o pedal mais fluido e seguro.',
        sections: [
          {
            heading: 'Leia o terreno antes',
            body:
              'Observe altimetria, tipo de piso, pontos de agua e opcoes de saida. Isso evita entrar em uma rota acima do seu nivel.',
          },
          {
            heading: 'Equipe-se para autonomia',
            body:
              'Leve bomba, camara, ferramenta, agua e alimento. Em trilhas, pequenos imprevistos viram grandes atrasos sem o kit certo.',
          },
          {
            heading: 'Respeite fluxo e sinalizacao',
            body:
              'Mantenha velocidade compativel, avise ultrapassagens e preserve a trilha. Boa conduta melhora a experiencia de todos.',
          },
        ],
      },
      en: {
        title: 'Mountain biking trails: top destinations',
        excerpt: 'Learn how to choose safe, fun trails that match your technical level.',
        category: 'Adventure',
        date: 'January 8, 2026',
        intro:
          'A good trail balances terrain, scenery, and challenge. Choosing well makes the ride smoother and safer.',
        sections: [
          {
            heading: 'Read the terrain first',
            body:
              'Check elevation, surface type, water points, and exit options. It keeps you from entering a route above your level.',
          },
          {
            heading: 'Pack for self support',
            body:
              'Carry a pump, tube, tool, water, and food. On trails, small issues become big delays without the right kit.',
          },
          {
            heading: 'Respect flow and signs',
            body:
              'Ride at a reasonable speed, announce passes, and protect the trail. Good conduct improves the experience for everyone.',
          },
        ],
      },
    },
  },
  {
    id: 'century-training',
    author: 'Emily Davis',
    marker: '04',
    tags: ['training', 'endurance', 'nutrition'],
    content: {
      'pt-br': {
        title: 'Treino para sua primeira prova longa',
        excerpt: 'Prepare corpo, alimentacao e equipamento para encarar distancias maiores com confianca.',
        category: 'Treino',
        date: '5 de Janeiro, 2026',
        intro:
          'Distancia longa nao e apenas forca. E ritmo, constancia, alimentacao e equipamento ajustado ao seu corpo.',
        sections: [
          {
            heading: 'Construa volume aos poucos',
            body:
              'Aumente a quilometragem semanal de forma progressiva e intercale pedais leves com treinos de ritmo.',
          },
          {
            heading: 'Treine a alimentacao',
            body:
              'Teste carboidratos, agua e sais nos treinos. Dia de prova nao e o momento para experimentar algo novo.',
          },
          {
            heading: 'Revise contato com a bike',
            body:
              'Selim, sapatilha, luvas e bretelle precisam estar confortaveis. Pequenas dores crescem muito depois de horas pedalando.',
          },
        ],
      },
      en: {
        title: 'Training for your first long ride',
        excerpt: 'Prepare your body, nutrition, and equipment to tackle longer distances with confidence.',
        category: 'Training',
        date: 'January 5, 2026',
        intro:
          'Long distance is not only strength. It is pacing, consistency, nutrition, and equipment that fits your body.',
        sections: [
          {
            heading: 'Build volume slowly',
            body:
              'Increase weekly mileage progressively and mix easy rides with steady tempo sessions.',
          },
          {
            heading: 'Practice nutrition',
            body:
              'Test carbs, water, and salts during training. Race day is not the time to try something new.',
          },
          {
            heading: 'Review bike contact points',
            body:
              'Saddle, shoes, gloves, and bibs must feel comfortable. Small aches grow after hours on the bike.',
          },
        ],
      },
    },
  },
  {
    id: 'cycling-tech',
    author: 'James Brown',
    marker: '05',
    tags: ['technology', 'gps', 'gear'],
    content: {
      'pt-br': {
        title: 'Tendencias em tecnologia de ciclismo',
        excerpt: 'Veja como GPS, sensores e acessorios inteligentes estao mudando a forma de treinar e pedalar.',
        category: 'Tecnologia',
        date: '1 de Janeiro, 2026',
        intro:
          'Tecnologia boa nao distrai: ela ajuda voce a entender o pedal, tomar decisoes e evoluir com mais clareza.',
        sections: [
          {
            heading: 'Dados que importam',
            body:
              'Velocidade media, cadencia, frequencia cardiaca e potencia contam uma historia. O valor esta em interpretar o conjunto.',
          },
          {
            heading: 'Seguranca conectada',
            body:
              'Luzes, radares e computadores com alertas ajudam a antecipar riscos, especialmente no transito urbano.',
          },
          {
            heading: 'Menos tela, mais pedal',
            body:
              'Configure telas simples e alertas uteis. A tecnologia deve apoiar sua atencao, nao competir com a estrada.',
          },
        ],
      },
      en: {
        title: 'The latest cycling technology trends',
        excerpt: 'See how GPS, sensors, and smart accessories are changing training and everyday riding.',
        category: 'Technology',
        date: 'January 1, 2026',
        intro:
          'Good technology does not distract. It helps you understand the ride, make decisions, and improve with clarity.',
        sections: [
          {
            heading: 'Data that matters',
            body:
              'Average speed, cadence, heart rate, and power tell a story. The value is in reading the whole picture.',
          },
          {
            heading: 'Connected safety',
            body:
              'Lights, radars, and head units with alerts help anticipate risk, especially in urban traffic.',
          },
          {
            heading: 'Less screen, more riding',
            body:
              'Set simple pages and useful alerts. Technology should support attention, not compete with the road.',
          },
        ],
      },
    },
  },
  {
    id: 'urban-cycling',
    author: 'Lisa Martinez',
    marker: '06',
    tags: ['urban', 'commute', 'safety'],
    content: {
      'pt-br': {
        title: 'Ciclismo urbano: dicas para pedalar na cidade',
        excerpt: 'Torne seu trajeto diario mais seguro, previsivel e agradavel com ajustes simples de rota e equipamento.',
        category: 'Urbano',
        date: '28 de Dezembro, 2025',
        intro:
          'Pedalar na cidade fica melhor quando voce combina visibilidade, previsibilidade e uma rota que respeita seu ritmo.',
        sections: [
          {
            heading: 'Seja previsivel',
            body:
              'Sinalize mudancas de direcao, mantenha linha constante e evite disputar espaco em pontos estreitos.',
          },
          {
            heading: 'Invista em visibilidade',
            body:
              'Luzes dianteira e traseira ajudam mesmo de dia. Roupas com contraste tambem facilitam ser visto.',
          },
          {
            heading: 'Planeje rotas melhores',
            body:
              'Nem sempre o caminho mais curto e o melhor. Ruas calmas e ciclovias podem poupar energia e stress.',
          },
        ],
      },
      en: {
        title: 'Urban cycling: tips for city commuting',
        excerpt: 'Make your daily commute safer, more predictable, and more enjoyable with simple route and gear choices.',
        category: 'Urban',
        date: 'December 28, 2025',
        intro:
          'City riding gets better when you combine visibility, predictability, and a route that respects your pace.',
        sections: [
          {
            heading: 'Be predictable',
            body:
              'Signal turns, hold a steady line, and avoid fighting for space in narrow spots.',
          },
          {
            heading: 'Invest in visibility',
            body:
              'Front and rear lights help even during the day. High contrast clothing also makes you easier to see.',
          },
          {
            heading: 'Plan better routes',
            body:
              'The shortest route is not always the best. Calmer streets and bike lanes can save energy and stress.',
          },
        ],
      },
    },
  },
];

export function getBlogPost(id: string | undefined): BlogPost | undefined {
  return blogPosts.find((post) => post.id === id);
}
