import express, { Response } from 'express';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { prisma } from '../prisma.js';

const router = express.Router();
const MAX_UNITS_PER_PRODUCT = 5;

const addItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(99).default(1),
});

const updateItemSchema = z.object({
  quantity: z.number().int().min(0).max(99),
});

const checkoutSchema = z.object({
  paymentMethod: z.string().min(1),
  shippingAddress: z.string().min(3),
});

class CheckoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CheckoutError';
  }
}

async function getOrCreateCart(userId: number) {
  return prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
}

async function getCartPayload(userId: number) {
  const cart = await getOrCreateCart(userId);
  const items = await prisma.cartItem.findMany({
    where: { cartId: cart.id },
    include: {
      product: {
        include: {
          category: true,
          brand: true,
          images: { orderBy: { sortOrder: 'asc' } },
          inventory: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  return {
    items: items.map((item: (typeof items)[number]) => ({
      id: item.product.id,
      name: item.product.name,
      description: item.product.description,
      price: item.unitPriceSnapshot,
      image: item.product.images[0]?.url || '/placeholder.svg',
      category: item.product.category.name,
      brand: item.product.brand.name,
      rating: item.product.ratingAvg,
      reviewCount: item.product.reviewCount,
      inStock: (item.product.inventory?.stock || 0) > 0,
      quantity: item.quantity,
    })),
  };
}

router.get('/', authMiddleware, asyncHandler<AuthRequest>(async (req, res: Response) => {
  if (!req.userId) {
    res.status(401).json({ error: 'Usuario nao identificado' });
    return;
  }

  const payload = await getCartPayload(req.userId);
  res.json(payload);
}));

router.post('/items', authMiddleware, asyncHandler<AuthRequest>(async (req, res: Response) => {
  if (!req.userId) {
    res.status(401).json({ error: 'Usuario nao identificado' });
    return;
  }

  const input = addItemSchema.parse(req.body);
  const cart = await getOrCreateCart(req.userId);

  const product = await prisma.product.findUnique({ where: { id: input.productId } });
  if (!product || !product.isActive) {
    res.status(404).json({ error: 'Produto nao encontrado' });
    return;
  }

  const existingItem = await prisma.cartItem.findUnique({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId: input.productId,
      },
    },
  });

  const currentQuantity = existingItem?.quantity || 0;
  const nextQuantity = currentQuantity + input.quantity;

  if (nextQuantity > MAX_UNITS_PER_PRODUCT) {
    res.status(400).json({
      error: `Limite maximo de ${MAX_UNITS_PER_PRODUCT} unidades por produto no carrinho.`,
    });
    return;
  }

  await prisma.cartItem.upsert({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId: input.productId,
      },
    },
    update: {
      quantity: { increment: input.quantity },
      unitPriceSnapshot: product.price,
    },
    create: {
      cartId: cart.id,
      productId: input.productId,
      quantity: input.quantity,
      unitPriceSnapshot: product.price,
    },
  });

  res.json(await getCartPayload(req.userId));
}));

router.patch('/items/:productId', authMiddleware, asyncHandler<AuthRequest>(async (req, res: Response) => {
  if (!req.userId) {
    res.status(401).json({ error: 'Usuario nao identificado' });
    return;
  }

  const input = updateItemSchema.parse(req.body);
  const cart = await getOrCreateCart(req.userId);

  if (input.quantity > MAX_UNITS_PER_PRODUCT) {
    res.status(400).json({
      error: `Limite maximo de ${MAX_UNITS_PER_PRODUCT} unidades por produto no carrinho.`,
    });
    return;
  }

  if (input.quantity === 0) {
    await prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
        productId: req.params.productId,
      },
    });
  } else {
    await prisma.cartItem.updateMany({
      where: {
        cartId: cart.id,
        productId: req.params.productId,
      },
      data: {
        quantity: input.quantity,
      },
    });
  }

  res.json(await getCartPayload(req.userId));
}));

router.delete('/items/:productId', authMiddleware, asyncHandler<AuthRequest>(async (req, res: Response) => {
  if (!req.userId) {
    res.status(401).json({ error: 'Usuario nao identificado' });
    return;
  }

  const cart = await getOrCreateCart(req.userId);
  await prisma.cartItem.deleteMany({
    where: {
      cartId: cart.id,
      productId: req.params.productId,
    },
  });

  res.json(await getCartPayload(req.userId));
}));

router.delete('/items', authMiddleware, asyncHandler<AuthRequest>(async (req, res: Response) => {
  if (!req.userId) {
    res.status(401).json({ error: 'Usuario nao identificado' });
    return;
  }

  const cart = await getOrCreateCart(req.userId);
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  res.json({ ok: true });
}));

router.post('/checkout', authMiddleware, asyncHandler<AuthRequest>(async (req, res: Response) => {
  if (!req.userId) {
    res.status(401).json({ error: 'Usuario nao identificado' });
    return;
  }

  const input = checkoutSchema.parse(req.body);
  const userId = req.userId;

  const orderResult = await prisma.$transaction(async (tx) => {
    const cart = await tx.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });

    const items = await tx.cartItem.findMany({
      where: { cartId: cart.id },
      include: {
        product: {
          include: {
            images: { orderBy: { sortOrder: 'asc' } },
            inventory: true,
          },
        },
      },
    });

    if (items.length === 0) {
      throw new CheckoutError('Carrinho vazio');
    }

    for (const item of items) {
      if (!item.product.isActive) {
        throw new CheckoutError(`Produto indisponivel: ${item.product.name}`);
      }

      const availableStock = item.product.inventory?.stock || 0;
      if (availableStock < item.quantity) {
        throw new CheckoutError(
          `Estoque insuficiente para ${item.product.name}. Disponivel: ${availableStock}`
        );
      }
    }

    const subtotal = items.reduce<number>(
      (sum: number, item: (typeof items)[number]) => sum + item.unitPriceSnapshot * item.quantity,
      0
    );
    const shippingCost = subtotal > 100 ? 0 : 9.99;
    const tax = subtotal * 0.23;
    const total = subtotal + shippingCost + tax;

    const order = await tx.order.create({
      data: {
        orderNumber: `VT-${Date.now()}-${userId}`,
        userId,
        subtotal,
        shippingCost,
        tax,
        total,
        paymentMethod: input.paymentMethod,
        shippingAddressSnapshot: input.shippingAddress,
        statusHistory: {
          create: {
            status: 'pending',
            note: 'Pedido criado',
          },
        },
        items: {
          create: items.map((item: (typeof items)[number]) => ({
            productId: item.productId,
            productName: item.product.name,
            productImage: item.product.images[0]?.url,
            quantity: item.quantity,
            unitPrice: item.unitPriceSnapshot,
            totalPrice: item.unitPriceSnapshot * item.quantity,
          })),
        },
        payments: {
          create: {
            method: input.paymentMethod,
            amount: total,
            status: 'pending',
          },
        },
      },
    });

    for (const item of items) {
      const updatedInventory = await tx.inventory.updateMany({
        where: {
          productId: item.productId,
          stock: { gte: item.quantity },
        },
        data: {
          stock: { decrement: item.quantity },
        },
      });

      if (updatedInventory.count !== 1) {
        throw new CheckoutError(`Estoque insuficiente para ${item.product.name}`);
      }
    }

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return { id: order.id, orderNumber: order.orderNumber, total: order.total };
  });

  res.status(201).json(orderResult);
}));

export default router;
