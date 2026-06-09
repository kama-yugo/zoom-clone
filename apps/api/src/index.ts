import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import roomsRouter from './routes/rooms';
import tokenRouter from './routes/token';

const app = express();
const PORT = process.env.PORT ?? 4000;

const allowedOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests with no origin (curl, mobile apps)
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`CORS: ${origin} not allowed`));
    },
  })
);
app.use(express.json());

app.use('/api/rooms', roomsRouter);
app.use('/api/token', tokenRouter);

app.get('/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
