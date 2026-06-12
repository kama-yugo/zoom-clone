import { Router, Request, Response } from 'express';
import { Resend } from 'resend';

const router = Router();

// POST /api/contact
router.post('/', async (req: Request, res: Response) => {
  const { name, email, message } = req.body;

  if (!name || !message) {
    return res.status(400).json({ error: 'name と message は必須です' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL;

  if (!apiKey || !toEmail) {
    console.error('RESEND_API_KEY or CONTACT_TO_EMAIL is not set');
    return res.status(500).json({ error: '通知の設定が完了していません' });
  }

  const resend = new Resend(apiKey);

  try {
    const { error } = await resend.emails.send({
      from: 'HASHi <onboarding@resend.dev>',
      to: toEmail,
      subject: `📩 HASHi お問い合わせ：${name}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
          <h2 style="color:#7c3aed;margin-bottom:16px">HASHi お問い合わせ</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr>
              <td style="padding:8px 0;color:#6b7280;font-size:14px;width:100px">お名前</td>
              <td style="padding:8px 0;color:#111827;font-size:14px">${name}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#6b7280;font-size:14px">メール</td>
              <td style="padding:8px 0;color:#111827;font-size:14px">${email || '（未記入）'}</td>
            </tr>
          </table>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0">
          <p style="color:#6b7280;font-size:14px;margin-bottom:8px">お問い合わせ内容</p>
          <p style="color:#111827;font-size:15px;line-height:1.7;white-space:pre-wrap">${message}</p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: 'メールの送信に失敗しました' });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'メールの送信に失敗しました' });
  }
});

export default router;
