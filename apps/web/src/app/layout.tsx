import type { Metadata } from 'next';
import './globals.css';
import '@livekit/components-styles';

export const metadata: Metadata = {
  title: 'HASHi — オンライン会議',
  description: 'HASHi — つながるオンライン会議サービス',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
