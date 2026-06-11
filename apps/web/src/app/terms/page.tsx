import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = { title: '利用規約 — HASHi' };

const LAST_UPDATED = '2026年6月10日';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-surface text-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 text-sm">
          <ArrowLeft className="w-4 h-4" /> トップに戻る
        </Link>

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">利用規約</h1>
          <p className="text-gray-500 text-sm">最終更新日：{LAST_UPDATED}</p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed text-gray-300">

          <Section title="第1条（サービスの概要）">
            HASHi（以下「本サービス」）は、インターネットを通じてビデオ会議・音声通話・テキストチャット等を行えるオンライン会議サービスです。本規約は、本サービスを利用するすべての方（以下「ユーザー」）に適用されます。
          </Section>

          <Section title="第2条（利用条件）">
            <p>ユーザーは以下の条件に同意した上で本サービスを利用するものとします。</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>本規約の内容を理解し、遵守すること</li>
              <li>会議への参加には、主催者から発行されたミーティングIDが必要です</li>
              <li>参加者名は自由に設定できますが、他者を欺く目的での使用は禁止します</li>
            </ul>
          </Section>

          <Section title="第3条（禁止事項）">
            <p>ユーザーは以下の行為を行ってはなりません。</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>法令または公序良俗に違反する行為</li>
              <li>他のユーザーへの誹謗・中傷・嫌がらせ</li>
              <li>わいせつ・暴力・差別的コンテンツの送信・共有</li>
              <li>第三者の著作権・肖像権・プライバシーを侵害する行為</li>
              <li>本サービスへの不正アクセス・過負荷をかける行為</li>
              <li>本サービスを商業目的で無断利用すること</li>
              <li>その他、運営者が不適切と判断する行為</li>
            </ul>
          </Section>

          <Section title="第4条（録音・録画・文字起こしに関する同意）">
            <p>本サービスでは、ユーザーが録画・文字起こし機能を利用できます。</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>録画・録音・文字起こしを行う場合は、<strong className="text-white">会議参加者全員の同意を事前に得てください</strong></li>
              <li>無断録音・録画は、プライバシーの侵害や法令違反となる場合があります</li>
              <li>録画・文字起こしデータはユーザー自身の端末に保存されます。本サービスはこれらのデータを収集・保存しません</li>
            </ul>
          </Section>

          <Section title="第5条（個人情報の取り扱い）">
            <p>本サービスが収集・保存する情報は以下に限られます。</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>ミーティングID・会議名・参加者名（表示用）</li>
              <li>会議の作成日時</li>
            </ul>
            <p className="mt-2">
              映像・音声・チャットメッセージ・文字起こしデータは本サービスのサーバーに保存されません。これらはユーザーの端末とLiveKitのインフラ（SFUサーバー）を経由してリアルタイムに処理されます。
            </p>
          </Section>

          <Section title="第6条（免責事項）">
            <ul className="list-disc pl-5 space-y-1">
              <li>本サービスは現状有姿で提供されます。動作の完全性・正確性・継続性を保証しません</li>
              <li>通信環境・端末性能・ブラウザの仕様により、一部機能が利用できない場合があります</li>
              <li>サービスの停止・変更・終了によってユーザーに損害が生じた場合、運営者は責任を負いません</li>
              <li>ユーザー間のトラブルについて、運営者は一切の責任を負いません</li>
            </ul>
          </Section>

          <Section title="第7条（サービスの変更・終了）">
            運営者は事前の通知なく、本サービスの内容の変更または提供の終了を行うことがあります。
          </Section>

          <Section title="第8条（規約の変更）">
            運営者は必要に応じて本規約を変更できるものとします。変更後も本サービスを継続して利用した場合、改定後の規約に同意したものとみなします。
          </Section>

          <Section title="第9条（準拠法）">
            本規約は日本法を準拠法とします。本サービスに関する紛争については、運営者の所在地を管轄する裁判所を専属的合意管轄裁判所とします。
          </Section>

        </div>

        <div className="mt-10 text-center text-gray-500 text-sm">
          <Link href="/help" className="hover:text-gray-300 transition-colors underline underline-offset-2">使い方</Link>
          <span className="mx-2">·</span>
          <Link href="/privacy" className="hover:text-gray-300 transition-colors underline underline-offset-2">プライバシーポリシー</Link>
          <span className="mx-2">·</span>
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
