export type SeedCategory = {
  slug: string;
  name: string;
  imageUrl?: string;
};

export type SeedProduct = {
  id: string;
  sku: string;
  slug: string;
  name: string;
  description: string;
  categorySlug: string;
  brandName: string;
  price: number;
  originalPrice?: number;
  ratingAvg: number;
  reviewCount: number;
  isNew?: boolean;
  isFeatured?: boolean;
  imageUrls: string[];
  specs?: Record<string, string>;
  stock: number;
};

export const seedCategories: SeedCategory[] = [
  { slug: 'bicycles', name: 'Bicycles', imageUrl: '/bikes/Captura de tela 2026-01-25 195843.png' },
  { slug: 'helmets', name: 'Helmets' },
  { slug: 'apparel', name: 'Apparel' },
  { slug: 'accessories', name: 'Accessories' },
];

export const seedProducts: SeedProduct[] = [
  {
    id: '1',
    sku: 'VT-HELM-001',
    slug: 'aerospeed-pro-helmet',
    name: 'AeroSpeed Pro Helmet',
    description: 'Ultra-lightweight aerodynamic helmet with MIPS protection system',
    categorySlug: 'helmets',
    brandName: 'VeloTech',
    price: 74.99,
    originalPrice: 94.99,
    ratingAvg: 4.8,
    reviewCount: 124,
    isNew: true,
    isFeatured: true,
    imageUrls: ['/assets/product-helmet.jpg'],
    specs: {
      Weight: '245g',
      Material: 'Carbon composite',
      Ventilation: '24 vents',
      Certification: 'CE EN1078, CPSC',
    },
    stock: 48,
  },
  {
    id: '2',
    sku: 'VT-APP-002',
    slug: 'prorace-elite-jersey',
    name: 'ProRace Elite Jersey',
    description: 'Professional-grade cycling jersey with moisture-wicking technology',
    categorySlug: 'apparel',
    brandName: 'VeloTech',
    price: 49.99,
    ratingAvg: 4.6,
    reviewCount: 89,
    isFeatured: true,
    imageUrls: ['/assets/product-jersey.jpg'],
    specs: {
      Material: 'Polyester blend',
      Fit: 'Race fit',
      Pockets: '3 rear pockets',
    },
    stock: 73,
  },
  {
    id: '3',
    sku: 'VT-BIKE-003',
    slug: 'carbon-apex-road-bike',
    name: 'Carbon Apex Road Bike',
    description: 'Full carbon frame road bike with Shimano Ultegra groupset',
    categorySlug: 'bicycles',
    brandName: 'VeloTech',
    price: 1599.99,
    originalPrice: 2149.99,
    ratingAvg: 4.9,
    reviewCount: 56,
    isNew: true,
    isFeatured: true,
    imageUrls: ['/assets/product-bike.jpg'],
    specs: {
      Frame: 'Full carbon monocoque',
      Groupset: 'Shimano Ultegra Di2',
      Weight: '7.2kg',
    },
    stock: 12,
  },
  {
    id: '4',
    sku: 'VT-ACC-004',
    slug: 'gripmax-pro-gloves',
    name: 'GripMax Pro Gloves',
    description: 'Premium cycling gloves with gel padding and touchscreen compatibility',
    categorySlug: 'accessories',
    brandName: 'VeloTech',
    price: 19.99,
    ratingAvg: 4.5,
    reviewCount: 203,
    imageUrls: ['/assets/product-gloves.jpg'],
    specs: {
      Material: 'Synthetic leather',
      Padding: '4mm gel',
      Features: 'Touchscreen tips',
    },
    stock: 110,
  },
  {
    id: '9',
    sku: 'VT-BIKE-009',
    slug: 'speedster-carbon-x',
    name: 'Speedster Carbon X',
    description: 'Bicicleta de estrada com quadro de carbono completo e componentes Shimano Ultegra',
    categorySlug: 'bicycles',
    brandName: 'VeloTech',
    price: 1299.95,
    originalPrice: 2599.9,
    ratingAvg: 4.8,
    reviewCount: 127,
    isFeatured: true,
    imageUrls: ['/bikes/Captura de tela 2026-01-25 195843.png'],
    stock: 16,
  },
  {
    id: '10',
    sku: 'VT-BIKE-010',
    slug: 'mountain-beast-pro',
    name: 'Mountain Beast Pro',
    description: 'Mountain bike de suspensão total para trilhas técnicas e descidas',
    categorySlug: 'bicycles',
    brandName: 'VeloTech',
    price: 1349.95,
    originalPrice: 2699.9,
    ratingAvg: 4.7,
    reviewCount: 98,
    imageUrls: ['/bikes/Captura de tela 2026-01-25 195901.png'],
    stock: 9,
  },
];
