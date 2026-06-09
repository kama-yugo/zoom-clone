import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import pool from '../db';

const router = Router();

function generateRoomId(): string {
  return randomBytes(5).toString('hex'); // 10-char hex string
}

// POST /api/rooms  — create a new room
router.post('/', async (req: Request, res: Response) => {
  const { name, hostName, password } = req.body;

  if (!name || !hostName) {
    return res.status(400).json({ error: 'name and hostName are required' });
  }

  const roomId = generateRoomId();
  const passwordHash = password ? await bcrypt.hash(password, 10) : null;

  try {
    const result = await pool.query(
      `INSERT INTO rooms (room_id, name, password_hash, host_name)
       VALUES ($1, $2, $3, $4)
       RETURNING room_id, name, host_name, created_at`,
      [roomId, name, passwordHash, hostName]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

// GET /api/rooms/:roomId  — get room info (no password returned)
router.get('/:roomId', async (req: Request, res: Response) => {
  const { roomId } = req.params;

  try {
    const result = await pool.query(
      `SELECT room_id, name, host_name, max_participants, created_at,
              (password_hash IS NOT NULL) AS has_password
       FROM rooms WHERE room_id = $1`,
      [roomId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch room' });
  }
});

// DELETE /api/rooms/:roomId  — delete room
router.delete('/:roomId', async (req: Request, res: Response) => {
  const { roomId } = req.params;

  try {
    await pool.query('DELETE FROM rooms WHERE room_id = $1', [roomId]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete room' });
  }
});

export default router;
