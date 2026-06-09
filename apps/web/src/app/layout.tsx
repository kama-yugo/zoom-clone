import type { Metadata } from 'next';
import './globals.css';
import '@livekit/components-styles';

export const metadata: Metadata = {
  title: 'MeetNow — Online Meeting',
  description: 'Zoom-like online meeting system',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
