// Logomarcas das marcas parceiras
export interface Brand {
  id: string;
  name: string;
  logo: string;
  url: string;
  description: string;
}

export const brandsData: Brand[] = [
  {
    id: "shimano",
    name: "Shimano",
    logo: "/logos/shimano.jpg",
    url: "https://www.shimano.com",
    description: "Componentes e grupos de bicicleta de classe mundial",
  },
  {
    id: "sram",
    name: "SRAM",
    logo: "/logos/sram.jpg",
    url: "https://www.sram.com",
    description: "Inovação em componentes de bicicleta",
  },
  {
    id: "continental",
    name: "Continental",
    logo: "/logos/continental.jpg",
    url: "https://www.continental-tires.com",
    description: "Pneus de bicicleta de alta qualidade e durabilidade",
  },
  {
    id: "garmin",
    name: "Garmin",
    logo: "/logos/garmin.jpeg",
    url: "https://www.garmin.com",
    description: "Tecnologia GPS e ciclocomputadores para ciclistas",
  },
  {
    id: "fizik",
    name: "Fizik",
    logo: "/logos/fizik.jpeg",
    url: "https://www.fizik.com",
    description: "Selins ergonômicos e acessórios de conforto",
  },
  {
    id: "castelli",
    name: "Castelli",
    logo: "/logos/castelli.jpeg",
    url: "https://www.castelli-cycling.com",
    description: "Vestuário de ciclismo de performance",
  },
  {
    id: "giro",
    name: "Giro",
    logo: "/logos/giro.jpeg",
    url: "https://www.giro.com",
    description: "Capacetes e acessórios de segurança para ciclistas",
  },
];
