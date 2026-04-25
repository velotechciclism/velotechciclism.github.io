import express, { Request, Response } from 'express';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { prisma } from '../prisma.js';

const router = express.Router();

const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().toLowerCase(),
  subject: z.string().trim().max(200).optional(),
  message: z.string().trim().min(5).max(5000),
});

const newsletterSchema = z.object({
  email: z.string().email(),
});

const activitySchema = z.object({
  sessionId: z.string().optional(),
  eventType: z.string().min(2).max(100),
  metadata: z.string().max(4000).optional(),
});

router.post('/contact/messages', asyncHandler(async (req: Request, res: Response) => {
  const payload = contactSchema.parse(req.body);

  const message = await prisma.contactMessage.create({
    data: payload,
  });

  res.status(201).json({ id: message.id });
}));

router.post('/newsletter/subscribe', asyncHandler(async (req: Request, res: Response) => {
  const payload = newsletterSchema.parse(req.body);

  const subscriber = await prisma.newsletterSubscriber.upsert({
    where: { email: payload.email },
    update: {
      status: 'active',
      unsubscribedAt: null,
    },
    create: {
      email: payload.email,
      status: 'active',
    },
  });

  res.status(201).json({ id: subscriber.id, status: subscriber.status });
}));

router.post('/activity/events', asyncHandler(async (req: Request, res: Response) => {
  const payload = activitySchema.parse(req.body);

  const activity = await prisma.userActivityEvent.create({
    data: {
      sessionId: payload.sessionId,
      eventType: payload.eventType,
      metadata: payload.metadata,
    },
  });

  res.status(201).json({ id: activity.id });
}));

router.post('/audit/events', authMiddleware, asyncHandler<AuthRequest>(async (req, res: Response) => {
  if (!req.userId) {
    res.status(401).json({ error: 'Usuario nao identificado' });
    return;
  }

  const payload = z
    .object({
      eventType: z.string().min(2).max(100),
      resource: z.string().max(100).optional(),
      resourceId: z.string().max(100).optional(),
      metadata: z.string().max(4000).optional(),
    })
    .parse(req.body);

  const auditEvent = await prisma.auditEvent.create({
    data: {
      userId: req.userId,
      eventType: payload.eventType,
      resource: payload.resource,
      resourceId: payload.resourceId,
      metadata: payload.metadata,
    },
  });

  res.status(201).json({ id: auditEvent.id });
}));

export default router;
