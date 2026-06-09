import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { AccessToken } from 'livekit-server-sdk';
import pool from '../db';

const router = Router();

// POST /api/token  — verify password and issue a LiveKit token
router.post('/', async (req: Request, res: Response) => {
  const { roomId, participantName, password } = req.body;

  if (!roomId || !participantName) {
    return res.status(400).json({ error: 'roomId and participantName are required' });
  }

  try {
    const result = await pool.query(
      'SELECT room_id, name, password_hash FROM rooms WHERE room_id = $1',
      [roomId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const room = result.rows[0];

    if (room.password_hash) {
      if (!password) {
        return res.status(401).json({ error: 'Password required' });
      }
      const valid = await bcrypt.compare(password, room.password_hash);
      if (!valid) {
        return res.status(401).json({ error: 'Invalid password' });
      }
    }

    const apiKey = process.env.LIVEKIT_API_KEY!;
    const apiSecret = process.env.LIVEKIT_API_SECRET!;

    const token = new AccessToken(apiKey, apiSecret, {
      identity: participantName,
      ttl: '4h',
    });

    token.addGrant({
      roomJoin: true,
      room: roomId,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const jwt = await token.toJwt();

    res.json({
      token: jwt,
      liveKitUrl: process.env.LIVEKIT_URL,
      roomName: room.name,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate token' });
  }
});

export default router;
