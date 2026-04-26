import express, { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { handleChatbotMessage } from './chatbot.js';

const router = express.Router();

router.post('/', asyncHandler(async (req: Request, res: Response) => {
  try {
    const data = await handleChatbotMessage(req.body);
    res.json(data);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(500).json({ error: 'Erro interno no assistente virtual' });
  }
}));

export default router;
