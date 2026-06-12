'use client';
import { useEffect, useRef, useState } from 'react';
import { Clock, ChevronsRight, X } from 'lucide-react';
import { TranscriptEntry } from '@/lib/api';

interface Props {
  entries: TranscriptEntry[];
  roomStartedAt: string;
  onCatchUp: () => void;
  onDismiss: () => void;
}

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `+${m}:${s}`;
}

export default function CatchUpPanel({ entries, roomStartedAt, onCatchUp, onDismiss }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(false);

  // 最下部にスクロール
  useEffect(() => {
    if (autoScroll) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries.length, autoScroll]);

  const lateBySeconds = Math.floor(
    (Date.now() - new Date(roomStartedAt).getTime()) / 1000
  );
  const lateMin = Math.floor(lateBySeconds / 60);

  return (
    <aside
      style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '22rem', zIndex: 20 }}
      className="bg-panel border-l border-purple-900 flex flex-col"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-purple-900 bg-purple-950/60">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" />
            <span className="font-semibold text-white text-sm">タイムトラベル</span>
          </div>
          <button onClick={onDismiss} className="text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-gray-400">
          {lateMin > 0
            ? `会議開始から約 ${lateMin} 分後に参加しました。過去の会話をキャッチアップできます。`
            : '会議の過去ログです。'}
        </p>
      </div>

      {/* Transcript log */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {entries.length === 0 ? (
          <p className="text-gray-500 text-sm text-center mt-12">
            この会議の文字起こしログはまだありません。<br />
            参加者が文字起こしを有効にすると記録されます。
          </p>
        ) : (
          entries.map((e) => (
            <div key={e.id} className="group">
              <div className="flex items-baseline gap-2 mb-0.5">
                <span className="text-purple-400 text-xs font-mono">{formatElapsed(e.elapsed_seconds)}</span>
                <span className="text-blue-400 text-xs font-medium">{e.speaker}</span>
              </div>
              <p className="text-sm text-gray-200 leading-relaxed pl-1">{e.text}</p>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Auto-scroll toggle */}
      <div className="px-3 pt-2 border-t border-purple-900 flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={autoScroll}
            onChange={e => setAutoScroll(e.target.checked)}
            className="accent-purple-500"
          />
          自動スクロール
        </label>
      </div>

      {/* Catch-up button */}
      <div className="p-3 border-t border-purple-900">
        <button
          onClick={onCatchUp}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm transition-colors"
        >
          <ChevronsRight className="w-4 h-4" />
          リアルタイムに追いつく
        </button>
        <p className="text-xs text-gray-500 text-center mt-2">
          押すと現在の会議にライブ合流します
        </p>
      </div>
    </aside>
  );
}
