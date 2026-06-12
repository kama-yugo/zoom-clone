import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = { title: '更新履歴 — HASHi' };

const releases = [
  {
    version: 'v1.7.0',
    date: '2026年6月12日',
    label: '最新',
    labelColor: 'bg-purple-600 text-white',
    changes: [
      { type: 'new', text: 'タイムトラベル機能：遅刻参加者が過去の会話をキャッチアップできる機能を追加' },
      { type: 'new', text: '「リアルタイムに追いつく」ボタンでライブモードへ即時移行' },
      { type: 'new', text: '文字起こしデータをサーバーに自動保存（会議開始からの経過時間付き）' },
    ],
  },
  {
    version: 'v1.6.0',
    date: '2026年6月11日',
    label: null,
    labelColor: '',
    changes: [
      { type: 'new', text: '入室前プレビュー：カメラ映像・マイクレベルを確認してから入室できる機能を追加' },
      { type: 'new', text: '挙手機能：参加者全員にリアルタイムで通知' },
      { type: 'new', text: '絵文字リアクション：👍😄👏🎉❤️😮 が画面上に浮き上がるアニメーション' },
      { type: 'new', text: 'QRコード：会議URLをQRコードで共有できる機能を追加' },
    ],
  },
  {
    version: 'v1.5.0',
    date: '2026年6月10日',
    label: null,
    labelColor: '',
    changes: [
      { type: 'new', text: 'お問い合わせフォームを追加（Formspree経由でメール通知）' },
      { type: 'new', text: '使い方ガイド（/help）を追加' },
      { type: 'new', text: '利用規約（/terms）を追加' },
      { type: 'new', text: 'プライバシーポリシー（/privacy）を追加' },
    ],
  },
  {
    version: 'v1.4.0',
    date: '2026年6月10日',
    label: null,
    labelColor: '',
    changes: [
      { type: 'new', text: '文字起こし機能：Web Speech APIによるリアルタイム音声認識（Chrome/Edge）' },
      { type: 'new', text: '文字起こしを .txt ファイルとしてダウンロードできる機能を追加' },
      { type: 'fix', text: 'チャットの送信者名が表示されない問題を修正' },
    ],
  },
  {
    version: 'v1.3.0',
    date: '2026年6月10日',
    label: null,
    labelColor: '',
    changes: [
      { type: 'new', text: 'バーチャル背景機能を追加（ぼかし3段階・グラデーション背景4種）' },
      { type: 'new', text: 'GPU処理による背景処理の高速化' },
      { type: 'change', text: 'アプリ名を MeetNow から HASHi に変更' },
    ],
  },
  {
    version: 'v1.2.0',
    date: '2026年6月9日',
    label: null,
    labelColor: '',
    changes: [
      { type: 'new', text: '本番環境への公開（Vercel + Render + LiveKit Cloud + Supabase）' },
      { type: 'fix', text: 'Supabase接続のIPv6エラーを修正（Transactionプールラーに変更）' },
      { type: 'fix', text: 'CORS設定を複数ドメイン対応に改善' },
    ],
  },
  {
    version: 'v1.1.0',
    date: '2026年6月9日',
    label: null,
    labelColor: '',
    changes: [
      { type: 'new', text: '参加者リスト：リアルタイムのマイク・カメラ状態を表示' },
      { type: 'new', text: '録画機能：ブラウザベースの録画と .webm ダウンロード' },
    ],
  },
  {
    version: 'v1.0.0',
    date: '2026年6月9日',
    label: '初回リリース',
    labelColor: 'bg-gray-700 text-gray-300',
    changes: [
      { type: 'new', text: 'ビデオ・音声通話（LiveKit SFU）' },
      { type: 'new', text: '画面共有' },
      { type: 'new', text: 'テキストチャット' },
      { type: 'new', text: 'ルーム作成・パスワード認証' },
      { type: 'new', text: 'ルームID共有機能' },
    ],
  },
];

const typeStyle: Record<string, string> = {
  new:    'bg-green-900/50 text-green-400 border border-green-800/50',
  fix:    'bg-red-900/50 text-red-400 border border-red-800/50',
  change: 'bg-yellow-900/50 text-yellow-400 border border-yellow-800/50',
};
const typeLabel: Record<string, string> = {
  new: '新機能', fix: '修正', change: '変更',
};

export default function ChangelogPage() {
  return (
    <main className="min-h-screen bg-surface text-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 text-sm">
          <ArrowLeft className="w-4 h-4" /> トップに戻る
        </Link>

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">更新履歴</h1>
          <p className="text-gray-400">HASHi のバージョンごとの変更内容です。</p>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-purple-900" />

          <div className="space-y-10">
            {releases.map((r) => (
              <div key={r.version} className="relative pl-8">
                {/* Timeline dot */}
                <div className="absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full bg-purple-700 border-2 border-purple-400" />

                <div className="bg-panel border border-purple-900 rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-lg font-bold text-white">{r.version}</span>
                    {r.label && (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${r.labelColor}`}>
                        {r.label}
                      </span>
                    )}
                    <span className="text-gray-500 text-sm ml-auto">{r.date}</span>
                  </div>

                  <ul className="space-y-2">
                    {r.changes.map((c, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                        <span className={`shrink-0 text-xs px-1.5 py-0.5 rounded font-medium mt-0.5 ${typeStyle[c.type]}`}>
                          {typeLabel[c.type]}
                        </span>
                        {c.text}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center text-gray-500 text-sm space-x-3">
          <Link href="/help" className="hover:text-gray-300 transition-colors underline underline-offset-2">使い方</Link>
          <span>·</span>
          <Link href="/terms" className="hover:text-gray-300 transition-colors underline underline-offset-2">利用規約</Link>
          <span>·</span>
          <Link href="/privacy" className="hover:text-gray-300 transition-colors underline underline-offset-2">プライバシーポリシー</Link>
          <span>·</span>
          <Link href="/" className="hover:text-gray-300 transition-colors underline underline-offset-2">トップに戻る</Link>
        </div>
      </div>
    </main>
  );
}
