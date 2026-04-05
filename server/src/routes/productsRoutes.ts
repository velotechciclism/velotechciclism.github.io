import express, { Request, Response } from 'express';
import { prisma } from '../prisma.js';

const router = express.Router();

router.get('/meta', async (_req: Request, res: Response) => {
  const [categories, brands] = await Promise.all([
    prisma.category.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
    prisma.brand.findMany({ orderBy: { name: 'asc' } }),
  ]);

  res.json({
    categories: categories.map((c: (typeof categories)[number]) => ({ id: c.slug, name: c.name })),
    brands: brands.map((b: (typeof brands)[number]) => b.name),
  });
});

router.get('/', async (req: Request, res: Response) => {
  const search = String(req.query.search || '').trim();
  const category = String(req.query.category || '').trim();
  const brand = String(req.query.brand || '').trim();
  const minPrice = Number(req.query.minPrice || 0);
  const maxPrice = Number(req.query.maxPrice || Number.MAX_SAFE_INTEGER);
  const sortBy = String(req.query.sortBy || 'featured');

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      price: { gte: minPrice, lte: maxPrice },
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { description: { contains: search } },
            ],
          }
        : {}),
      ...(category ? { category: { slug: category } } : {}),
      ...(brand ? { brand: { name: brand } } : {}),
    },
    include: {
      category: true,
      brand: true,
      images: { orderBy: { sortOrder: 'asc' } },
      specs: { orderBy: { sortOrder: 'asc' } },
      inventory: true,
    },
  });

  const sorted = [...products];
  switch (sortBy) {
    case 'price-asc':
      sorted.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      sorted.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      sorted.sort((a, b) => b.ratingAvg - a.ratingAvg);
      break;
    case 'newest':
      sorted.sort((a, b) => Number(b.isNew) - Number(a.isNew));
      break;
    default:
      sorted.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));
      break;
  }

  res.json(
    sorted.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      originalPrice: p.originalPrice,
      image: p.images[0]?.url || '/placeholder.svg',
      category: p.category.name,
      brand: p.brand.name,
      rating: p.ratingAvg,
      reviewCount: p.reviewCount,
      inStock: (p.inventory?.stock || 0) > 0,
      isNew: p.isNew,
      isFeatured: p.isFeatured,
      specs: Object.fromEntries(
        p.specs.map((spec: (typeof p.specs)[number]) => [spec.name, spec.value])
      ),
    }))
  );
});

router.get('/:id', async (req: Request, res: Response) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: {
      category: true,
      brand: true,
      images: { orderBy: { sortOrder: 'asc' } },
      specs: { orderBy: { sortOrder: 'asc' } },
      inventory: true,
    },
  });

  if (!product || !product.isActive) {
    res.status(404).json({ error: 'Produto nao encontrado' });
    return;
  }

  res.json({
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    originalPrice: product.originalPrice,
    image: product.images[0]?.url || '/placeholder.svg',
    images: product.images.map((image: (typeof product.images)[number]) => image.url),
    category: product.category.name,
    brand: product.brand.name,
    rating: product.ratingAvg,
    reviewCount: product.reviewCount,
    inStock: (product.inventory?.stock || 0) > 0,
    isNew: product.isNew,
    isFeatured: product.isFeatured,
    specs: Object.fromEntries(
      product.specs.map((spec: (typeof product.specs)[number]) => [spec.name, spec.value])
    ),
  });
});

export default router;
