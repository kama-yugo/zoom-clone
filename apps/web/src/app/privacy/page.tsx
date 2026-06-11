import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = { title: 'プライバシーポリシー — HASHi' };

const LAST_UPDATED = '2026年6月11日';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-surface text-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 text-sm">
          <ArrowLeft className="w-4 h-4" /> トップに戻る
        </Link>

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">プライバシーポリシー</h1>
          <p className="text-gray-500 text-sm">最終更新日：{LAST_UPDATED}</p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed text-gray-300">

          <Section title="1. はじめに">
            HASHi（以下「本サービス」）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めます。本ポリシーは、本サービスが収集・利用・管理する情報について説明します。
          </Section>

          <Section title="2. 収集する情報">
            <p>本サービスが収集・データベースに保存する情報は以下のみです。</p>
            <table className="mt-3 w-full text-xs border-collapse">
              <thead>
                <tr className="bg-purple-900/40 text-gray-200">
                  <th className="text-left px-3 py-2 rounded-tl-lg">項目</th>
                  <th className="text-left px-3 py-2">内容</th>
                  <th className="text-left px-3 py-2 rounded-tr-lg">保存場所</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-900/40">
                {[
                  ['ミーティングID', '自動生成される10桁の識別子', 'サーバー（Supabase）'],
                  ['会議名', 'ユーザーが入力した会議の名称', 'サーバー（Supabase）'],
                  ['参加者名', '会議作成・参加時に入力した名前', 'サーバー（Supabase）'],
                  ['会議作成日時', 'ルーム作成時のタイムスタンプ', 'サーバー（Supabase）'],
                  ['パスワード（任意）', 'bcryptでハッシュ化して保存。原文は保持しない', 'サーバー（Supabase）'],
                ].map(([item, desc, loc]) => (
                  <tr key={item} className="hover:bg-purple-900/10">
                    <td className="px-3 py-2 font-medium text-gray-200">{item}</td>
                    <td className="px-3 py-2">{desc}</td>
                    <td className="px-3 py-2 text-gray-400">{loc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section title="3. 収集しない情報">
            <p>以下の情報は本サービスのサーバーに収集・保存されません。</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>映像・音声データ（リアルタイム中継のみ。録画はユーザーの端末にのみ保存）</li>
              <li>チャットメッセージの内容</li>
              <li>文字起こしのテキスト</li>
              <li>IPアドレス・位置情報・デバイス情報</li>
              <li>Cookieその他のトラッキング情報</li>
            </ul>
          </Section>

          <Section title="4. 情報の利用目的">
            <p>収集した情報は以下の目的にのみ使用します。</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>会議ルームの識別・管理</li>
              <li>参加者の表示名の表示</li>
              <li>パスワード保護された会議の認証</li>
            </ul>
            <p className="mt-2">広告配信・第三者への販売・マーケティングには一切使用しません。</p>
          </Section>

          <Section title="5. 第三者サービスの利用">
            <p>本サービスは以下の第三者サービスを利用しており、それぞれのプライバシーポリシーが適用されます。</p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>
                <span className="font-medium text-white">LiveKit</span> — 映像・音声のリアルタイム中継（SFUサーバー）。
                通話データはLiveKitのインフラを経由します。
              </li>
              <li>
                <span className="font-medium text-white">Supabase</span> — データベース（PostgreSQL）のホスティング。
                会議情報の保存に使用します。
              </li>
              <li>
                <span className="font-medium text-white">Vercel</span> — フロントエンドのホスティング。
              </li>
              <li>
                <span className="font-medium text-white">Render</span> — APIサーバーのホスティング。
              </li>
            </ul>
          </Section>

          <Section title="6. データの保持期間">
            会議ルームの情報（ミーティングID・会議名・参加者名）は、会議終了後も削除されずに保持されます。不要になったルームの削除を希望する場合は、運営者にお問い合わせください。
          </Section>

          <Section title="7. セキュリティ">
            <ul className="list-disc pl-5 space-y-1">
              <li>通信はすべてHTTPS/TLSで暗号化されています</li>
              <li>パスワードはbcryptによりハッシュ化して保存します（原文は保持しません）</li>
              <li>データベースへの直接アクセスは制限されています</li>
            </ul>
          </Section>

          <Section title="8. お問い合わせ">
            プライバシーに関するご質問・ご要望は、サービス運営者までお問い合わせください。
          </Section>

          <Section title="9. ポリシーの変更">
            本ポリシーは必要に応じて更新することがあります。重要な変更がある場合はサービス上でお知らせします。
          </Section>

        </div>

        <div className="mt-10 text-center text-gray-500 text-sm space-x-3">
          <Link href="/help" className="hover:text-gray-300 transition-colors underline underline-offset-2">使い方</Link>
          <span>·</span>
          <Link href="/terms" className="hover:text-gray-300 transition-colors underline underline-offset-2">利用規約</Link>
          <span>·</span>
          <Link href="/" className="hover:text-gray-300 transition-colors underline underline-offset-2">トップに戻る</Link>
        </div>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-semibold text-white mb-2">{title}</h2>
      <div className="text-gray-300">{children}</div>
    </section>
  );
}
