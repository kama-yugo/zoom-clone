import { Router, Request, Response } from 'express';

const router = Router();

// POST /api/contact
router.post('/', async (req: Request, res: Response) => {
  const { name, email, message } = req.body;

  if (!name || !message) {
    return res.status(400).json({ error: 'name と message は必須です' });
  }

  const token = process.env.LINE_NOTIFY_TOKEN;
  if (!token) {
    console.error('LINE_NOTIFY_TOKEN is not set');
    return res.status(500).json({ error: '通知の設定が完了していません' });
  }

  const text = [
    '\n📩 HASHi お問い合わせ',
    `お名前: ${name}`,
    email ? `メール: ${email}` : 'メール: (未記入)',
    `─────────────`,
    message,
  ].join('\n');

  try {
    const response = await fetch('https://notify-api.line.me/api/notify', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ message: text }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error('LINE Notify error:', body);
      return res.status(500).json({ error: '通知の送信に失敗しました' });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '通知の送信に失敗しました' });
  }
});

export default router;
