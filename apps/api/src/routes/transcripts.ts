import { Router, Request, Response } from 'express';
import pool from '../db';

const router = Router();

// POST /api/transcripts — save one transcript entry
router.post('/', async (req: Request, res: Response) => {
  const { roomId, speaker, text, elapsedSeconds } = req.body;
  if (!roomId || !speaker || !text) {
    return res.status(400).json({ error: 'roomId, speaker, text are required' });
  }
  try {
    await pool.query(
      `INSERT INTO transcripts (room_id, speaker, text, elapsed_seconds)
       VALUES ($1, $2, $3, $4)`,
      [roomId, speaker, text, elapsedSeconds ?? 0]
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save transcript' });
  }
});

// GET /api/transcripts/:roomId — get all entries for a room
router.get('/:roomId', async (req: Request, res: Response) => {
  const { roomId } = req.params;
  try {
    const result = await pool.query(
      `SELECT id, speaker, text, elapsed_seconds, created_at
       FROM transcripts
       WHERE room_id = $1
       ORDER BY created_at ASC`,
      [roomId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch transcripts' });
  }
});

export default router;
