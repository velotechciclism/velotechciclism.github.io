import { prisma } from '../prisma.js';
import { seedCategories, seedProducts } from '../data/catalogSeed.js';

const MAX_PRODUCT_PRICE_EUR = 560;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function ensureCatalogSeeded(): Promise<void> {
  const seedCategorySlugs = seedCategories.map((category) => category.slug);
  const seedProductIds = seedProducts.map((product) => product.id);

  await prisma.category.updateMany({
    where: {
      slug: { notIn: seedCategorySlugs },
    },
    data: {
      isActive: false,
    },
  });

  await prisma.product.updateMany({
    where: {
      id: { notIn: seedProductIds },
    },
    data: {
      isActive: false,
    },
  });

  for (const category of seedCategories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        imageUrl: category.imageUrl,
        isActive: true,
      },
      create: {
        slug: category.slug,
        name: category.name,
        imageUrl: category.imageUrl,
        isActive: true,
      },
    });
  }

  for (const item of seedProducts) {
    const cappedPrice = Math.min(item.price, MAX_PRODUCT_PRICE_EUR);
    const cappedOriginalPrice = item.originalPrice
      ? Math.min(item.originalPrice, MAX_PRODUCT_PRICE_EUR)
      : null;

    const category = await prisma.category.findUnique({ where: { slug: item.categorySlug } });

    if (!category) {
      continue;
    }

    const brand = await prisma.brand.upsert({
      where: { name: item.brandName },
      update: {},
      create: {
        name: item.brandName,
        slug: slugify(item.brandName),
      },
    });

    await prisma.product.upsert({
      where: { id: item.id },
      update: {
        sku: item.sku,
        slug: item.slug,
        name: item.name,
        description: item.description,
        categoryId: category.id,
        brandId: brand.id,
        price: cappedPrice,
        originalPrice: cappedOriginalPrice,
        ratingAvg: item.ratingAvg,
        reviewCount: item.reviewCount,
        isNew: Boolean(item.isNew),
        isFeatured: Boolean(item.isFeatured),
        isActive: true,
      },
      create: {
        id: item.id,
        sku: item.sku,
        slug: item.slug,
        name: item.name,
        description: item.description,
        categoryId: category.id,
        brandId: brand.id,
        price: cappedPrice,
        originalPrice: cappedOriginalPrice,
        ratingAvg: item.ratingAvg,
        reviewCount: item.reviewCount,
        isNew: Boolean(item.isNew),
        isFeatured: Boolean(item.isFeatured),
        isActive: true,
      },
    });

    await prisma.inventory.upsert({
      where: { productId: item.id },
      update: {
        stock: item.stock,
      },
      create: {
        productId: item.id,
        stock: item.stock,
      },
    });

    await prisma.productImage.deleteMany({ where: { productId: item.id } });
    await prisma.productSpec.deleteMany({ where: { productId: item.id } });

    for (let index = 0; index < item.imageUrls.length; index += 1) {
      await prisma.productImage.create({
        data: {
          productId: item.id,
          url: item.imageUrls[index],
          sortOrder: index,
        },
      });
    }

    const specsEntries = Object.entries(item.specs || {});
    for (let index = 0; index < specsEntries.length; index += 1) {
      const [name, value] = specsEntries[index];
      await prisma.productSpec.create({
        data: {
          productId: item.id,
          name,
          value,
          sortOrder: index,
        },
      });
    }
  }
}
