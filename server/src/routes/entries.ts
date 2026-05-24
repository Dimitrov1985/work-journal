import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// GET /api/entries?startDate=&endDate=&sort=asc|desc
router.get('/', async (req: Request, res: Response) => {
  const { startDate, endDate, sort } = req.query;

  const where: Record<string, unknown> = {};

  if (startDate || endDate) {
    where.date = {
      ...(startDate ? { gte: new Date(startDate as string) } : {}),
      ...(endDate ? { lte: new Date(endDate as string) } : {}),
    };
  }

  const entries = await prisma.workEntry.findMany({
    where,
    include: { workType: true },
    orderBy: { date: sort === 'asc' ? 'asc' : 'desc' },
  });

  res.json(entries);
});

// POST /api/entries
router.post('/', async (req: Request, res: Response) => {
  const { date, workTypeId, volume, unit, executorName } = req.body;

  if (!date || !workTypeId || !volume || !unit || !executorName) {
    res.status(400).json({ error: 'Все поля обязательны' });
    return;
  }

  const entry = await prisma.workEntry.create({
    data: {
      date: new Date(date),
      workTypeId: Number(workTypeId),
      volume: Number(volume),
      unit,
      executorName,
    },
    include: { workType: true },
  });

  res.status(201).json(entry);
});

// PUT /api/entries/:id
router.put('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { date, workTypeId, volume, unit, executorName } = req.body;

  if (!date || !workTypeId || !volume || !unit || !executorName) {
    res.status(400).json({ error: 'Все поля обязательны' });
    return;
  }

  const entry = await prisma.workEntry.update({
    where: { id },
    data: {
      date: new Date(date),
      workTypeId: Number(workTypeId),
      volume: Number(volume),
      unit,
      executorName,
    },
    include: { workType: true },
  });

  res.json(entry);
});

// DELETE /api/entries/:id
router.delete('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  await prisma.workEntry.delete({ where: { id } });

  res.status(204).send();
});

export default router;
