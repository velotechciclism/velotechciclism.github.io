export type BlogLanguage = 'pt-br';

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
    id: 'manutencao',
    author: 'André Silva',
    marker: '01',
    tags: ['manutenção', 'iniciantes', 'oficina'],
    content: {
      'pt-br': {
        title: 'Dicas essenciais de manutenção para iniciantes',
        excerpt: 'Aprenda as rotinas básicas para manter sua bicicleta confiável, limpa e pronta para o próximo pedal.',
        category: 'Manutenção',
        date: '12 de janeiro de 2026',
        intro:
          'Uma bicicleta bem cuidada roda melhor, dura mais e evita sustos no meio do caminho. O segredo é transformar pequenos cuidados em rotina.',
        sections: [
          {
            heading: 'Comece pela limpeza certa',
            body:
              'Use pano macio, escova pequena e desengraxante na transmissão. Evite jatos fortes diretamente em rolamentos, cubos e movimento central.',
          },
          {
            heading: 'Lubrifique com critério',
            body:
              'A corrente deve ficar lubrificada, mas não encharcada. Depois de aplicar o lubrificante, gire os pedais e remova o excesso com um pano seco.',
          },
          {
            heading: 'Cheque antes de sair',
            body:
              'Pressão dos pneus, travões, aperto das rodas e funcionamento das mudanças resolvem a maioria dos problemas antes de eles aparecerem na rua.',
          },
        ],
      },
    },
  },
  {
    id: 'guia-capacete',
    author: 'Sofia Costa',
    marker: '02',
    tags: ['segurança', 'capacete', 'ajuste'],
    content: {
      'pt-br': {
        title: 'Escolhendo o capacete certo: guia completo',
        excerpt: 'Segurança em primeiro lugar: veja como escolher um capacete confortável, ventilado e adequado ao seu uso.',
        category: 'Segurança',
        date: '10 de janeiro de 2026',
        intro:
          'O melhor capacete é aquele que você usa em todos os pedais. Ajuste, certificação e conforto contam tanto quanto o estilo.',
        sections: [
          {
            heading: 'Priorize certificação',
            body:
              'Procure modelos com certificações reconhecidas e boa cobertura lateral. Tecnologias de proteção rotacional também são bem-vindas.',
          },
          {
            heading: 'Ajuste sem pontos de pressão',
            body:
              'O capacete deve ficar firme sem apertar. A cinta precisa formar um V abaixo das orelhas e permitir abrir a boca confortavelmente.',
          },
          {
            heading: 'Escolha pelo uso',
            body:
              'Estrada pede leveza e ventilação. Trilha pede cobertura maior. Uso urbano valoriza visibilidade e praticidade.',
          },
        ],
      },
    },
  },
  {
    id: 'trilhas-bicicleta',
    author: 'Miguel Rocha',
    marker: '03',
    tags: ['trilha', 'bicicleta de montanha', 'aventura'],
    content: {
      'pt-br': {
        title: 'Trilhas de bicicleta de montanha: melhores destinos',
        excerpt: 'Conheça critérios para escolher trilhas seguras, divertidas e coerentes com seu nível técnico.',
        category: 'Aventura',
        date: '8 de janeiro de 2026',
        intro:
          'Uma boa trilha combina terreno, visual e desafio na medida certa. Escolher bem deixa o pedal mais fluido e seguro.',
        sections: [
          {
            heading: 'Leia o terreno antes',
            body:
              'Observe altimetria, tipo de piso, pontos de água e opções de saída. Isso evita entrar em uma rota acima do seu nível.',
          },
          {
            heading: 'Equipe-se para autonomia',
            body:
              'Leve bomba, câmara, ferramenta, água e alimento. Em trilhas, pequenos imprevistos viram grandes atrasos sem o conjunto certo.',
          },
          {
            heading: 'Respeite fluxo e sinalização',
            body:
              'Mantenha velocidade compatível, avise ultrapassagens e preserve a trilha. Boa conduta melhora a experiência de todos.',
          },
        ],
      },
    },
  },
  {
    id: 'treino-prova-longa',
    author: 'Emília Duarte',
    marker: '04',
    tags: ['treino', 'resistência', 'alimentação'],
    content: {
      'pt-br': {
        title: 'Treino para sua primeira prova longa',
        excerpt: 'Prepare corpo, alimentação e equipamento para encarar distâncias maiores com confiança.',
        category: 'Treino',
        date: '5 de janeiro de 2026',
        intro:
          'Distância longa não é apenas força. É ritmo, constância, alimentação e equipamento ajustado ao seu corpo.',
        sections: [
          {
            heading: 'Construa volume aos poucos',
            body:
              'Aumente a quilometragem semanal de forma progressiva e intercale pedais leves com treinos de ritmo.',
          },
          {
            heading: 'Treine a alimentação',
            body:
              'Teste carboidratos, água e sais nos treinos. Dia de prova não é o momento para experimentar algo novo.',
          },
          {
            heading: 'Revise contato com a bicicleta',
            body:
              'Selim, sapatilha, luvas e bretelle precisam estar confortáveis. Pequenas dores crescem muito depois de horas pedalando.',
          },
        ],
      },
    },
  },
  {
    id: 'tecnologia-ciclismo',
    author: 'Tiago Martins',
    marker: '05',
    tags: ['tecnologia', 'navegação', 'equipamento'],
    content: {
      'pt-br': {
        title: 'Tendências em tecnologia de ciclismo',
        excerpt: 'Veja como navegação, sensores e acessórios inteligentes estão mudando a forma de treinar e pedalar.',
        category: 'Tecnologia',
        date: '1 de janeiro de 2026',
        intro:
          'Tecnologia boa não distrai: ela ajuda você a entender o pedal, tomar decisões e evoluir com mais clareza.',
        sections: [
          {
            heading: 'Dados que importam',
            body:
              'Velocidade média, cadência, frequência cardíaca e potência contam uma história. O valor está em interpretar o conjunto.',
          },
          {
            heading: 'Segurança conectada',
            body:
              'Luzes, radares e computadores com alertas ajudam a antecipar riscos, especialmente no trânsito urbano.',
          },
          {
            heading: 'Menos tela, mais pedal',
            body:
              'Configure telas simples e alertas úteis. A tecnologia deve apoiar sua atenção, não competir com a estrada.',
          },
        ],
      },
    },
  },
  {
    id: 'ciclismo-urbano',
    author: 'Luísa Ferreira',
    marker: '06',
    tags: ['urbano', 'deslocamento', 'segurança'],
    content: {
      'pt-br': {
        title: 'Ciclismo urbano: dicas para pedalar na cidade',
        excerpt: 'Torne seu trajeto diário mais seguro, previsível e agradável com ajustes simples de rota e equipamento.',
        category: 'Urbano',
        date: '28 de dezembro de 2025',
        intro:
          'Pedalar na cidade fica melhor quando você combina visibilidade, previsibilidade e uma rota que respeita seu ritmo.',
        sections: [
          {
            heading: 'Seja previsível',
            body:
              'Sinalize mudanças de direção, mantenha linha constante e evite disputar espaço em pontos estreitos.',
          },
          {
            heading: 'Invista em visibilidade',
            body:
              'Luzes dianteira e traseira ajudam mesmo de dia. Roupas com contraste também facilitam ser visto.',
          },
          {
            heading: 'Planeje rotas melhores',
            body:
              'Nem sempre o caminho mais curto é o melhor. Ruas calmas e ciclovias podem poupar energia e stress.',
          },
        ],
      },
    },
  },
];

export function getBlogPost(id: string | undefined): BlogPost | undefined {
  return blogPosts.find((post) => post.id === id);
}
