import express, { Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { prisma } from '../prisma.js';

const router = express.Router();

router.get('/me', authMiddleware, asyncHandler<AuthRequest>(async (req, res: Response) => {
  if (!req.userId) {
    res.status(401).json({ error: 'Usuario nao identificado' });
    return;
  }

  const orders = await prisma.order.findMany({
    where: { userId: req.userId },
    include: {
      items: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json(
    orders.map((order: (typeof orders)[number]) => ({
      id: order.id,
      user_id: String(order.userId),
      total: order.total,
      status: order.status,
      payment_method: order.paymentMethod,
      shipping_address: order.shippingAddressSnapshot,
      created_at: order.createdAt.toISOString(),
      updated_at: order.updatedAt.toISOString(),
      items: order.items.map((item: (typeof order.items)[number]) => ({
        id: item.id,
        product_id: item.productId,
        product_name: item.productName,
        product_image: item.productImage,
        product_price: item.unitPrice,
        quantity: item.quantity,
      })),
    }))
  );
}));

export default router;
