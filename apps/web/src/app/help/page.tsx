import Link from 'next/link';
import { Video, Users, Mic, Monitor, MessageSquare, FileText, ImageIcon, Circle, ArrowLeft, Chrome } from 'lucide-react';

export const metadata = { title: 'ヘルプ・使い方 — HASHi' };

const sections = [
  {
    icon: Video,
    title: '会議を作成する',
    steps: [
      'トップ画面の「新しい会議を開始」をタップ',
      '会議名・あなたの名前を入力',
      'パスワードを設定する場合は入力（任意）',
      '「作成して参加」をクリック',
      '画面上部のミーティングIDをコピーして参加者に共有',
    ],
  },
  {
    icon: Users,
    title: '会議に参加する',
    steps: [
      'トップ画面の「会議に参加」をタップ',
      '主催者から受け取ったミーティングIDを入力',
      '自分の名前を入力',
      '「参加する」をクリック',
      'パスワードが設定されている場合は次の画面で入力',
    ],
  },
  {
    icon: Mic,
    title: '映像・音声の操作',
    steps: [
      '画面下部のコントロールバーでマイク・カメラのオン/オフを切り替え',
      'ミュートにしても映像は相手に見えます',
      'カメラをオフにするとアバターが表示されます',
    ],
  },
  {
    icon: Monitor,
    title: '画面共有',
    steps: [
      'コントロールバーの画面共有ボタンをクリック',
      '共有する画面・ウィンドウ・タブを選択',
      '停止するには「共有を停止」をクリック',
    ],
  },
  {
    icon: MessageSquare,
    title: 'チャット',
    steps: [
      'コントロールバーのチャットアイコンをクリック',
      'テキストを入力して Enter または送信ボタン',
      'チャットはルーム内の全員に送信されます',
    ],
  },
  {
    icon: Circle,
    title: '録画',
    steps: [
      'ヘッダーの「録画」ボタンをクリック',
      '画面共有ダイアログが開くので録画したいタブや画面を選択',
      '「録画停止」を押すと .webm ファイルが自動ダウンロードされます',
    ],
  },
  {
    icon: FileText,
    title: '文字起こし',
    steps: [
      'ヘッダーの「文字起こし」ボタンをクリック',
      '右側にパネルが開いたら「開始」を押す',
      'マイクの使用許可を求められたら「許可」をクリック',
      '話した言葉がリアルタイムで表示されます',
      '終了後「保存」で .txt ファイルとしてダウンロードできます',
    ],
    note: 'Chrome または Microsoft Edge のみ対応しています。',
  },
  {
    icon: ImageIcon,
    title: 'バーチャル背景',
    steps: [
      'ヘッダーの「背景」ボタンをクリック',
      'ぼかし（強/中/弱）または背景画像を選択',
      '「なし」を選ぶと元の背景に戻ります',
    ],
    note: 'バーチャル背景はブラウザの処理能力に依存します。古い端末では動作が重くなる場合があります。',
  },
];

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-surface text-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 text-sm">
          <ArrowLeft className="w-4 h-4" /> トップに戻る
        </Link>

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">使い方ガイド</h1>
          <p className="text-gray-400">HASHi の各機能の使い方を説明します。</p>
        </div>

        {/* Browser support */}
        <div className="flex items-start gap-3 bg-yellow-900/20 border border-yellow-700/40 rounded-xl px-4 py-3 mb-8">
          <Chrome className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-300">
            <span className="font-semibold">推奨ブラウザ：</span> Google Chrome または Microsoft Edge。
            Safari・Firefox では一部機能（文字起こし等）が利用できない場合があります。
          </div>
        </div>

        <div className="space-y-6">
          {sections.map((s) => (
            <div key={s.title} className="bg-panel border border-purple-900 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-purple-800 flex items-center justify-center shrink-0">
                  <s.icon className="w-4 h-4 text-purple-300" />
                </div>
                <h2 className="text-lg font-semibold text-white">{s.title}</h2>
              </div>
              <ol className="space-y-2">
                {s.steps.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-300">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-purple-900 text-purple-300 text-xs flex items-center justify-center font-bold">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
              {s.note && (
                <p className="mt-3 text-xs text-gray-500 border-t border-purple-900 pt-3">⚠️ {s.note}</p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 text-center text-gray-500 text-sm">
          <Link href="/terms" className="hover:text-gray-300 transition-colors underline underline-offset-2">利用規約</Link>
          <span className="mx-2">·</span>
          <Link href="/privacy" className="hover:text-gray-300 transition-colors underline underline-offset-2">プライバシーポリシー</Link>
        </div>
      </div>
    </main>
  );
}
