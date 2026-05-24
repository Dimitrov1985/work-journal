import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

router.get('/', async (_req, res) => {
  const types = await prisma.workType.findMany({ orderBy: { name: 'asc' } });
  res.json(types);
});

export default router;
