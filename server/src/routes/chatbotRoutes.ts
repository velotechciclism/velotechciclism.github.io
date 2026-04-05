import express, { Request, Response } from 'express';
import { handleChatbotMessage } from './chatbot.js';

const router = express.Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const data = await handleChatbotMessage(req.body);
    res.json(data);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(500).json({ error: 'Erro interno no chatbot' });
  }
});

export default router;
