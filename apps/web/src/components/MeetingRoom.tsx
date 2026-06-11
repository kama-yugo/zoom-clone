'use client';
import { useEffect, useRef, useState } from 'react';
import {
  LiveKitRoom,
  VideoConference,
  useParticipants,
  useLocalParticipant,
  useRoomContext,
  useDataChannel,
} from '@livekit/components-react';
import { LocalVideoTrack, Track } from 'livekit-client';
import { BackgroundBlur, VirtualBackground } from '@livekit/track-processors';
import clsx from 'clsx';
import {
  Check,
  Circle,
  Copy,
  Download,
  FileText,
  Hand,
  ImageIcon,
  Loader2,
  Mic,
  MicOff,
  QrCode,
  Smile,
  Square,
  Users,
  Video,
  VideoOff,
  X,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Props {
  token: string;
  serverUrl: string;
  roomName: string;
  participantName: string;
  roomId: string;
  onLeave: () => void;
}

interface TranscriptEntry {
  id: string;
  speaker: string;
  text: string;
  timestamp: Date;
  isFinal: boolean;
}

interface FloatingEmoji {
  id: string;
  emoji: string;
  x: number;
}

const MSG_RAISE_HAND = 'raise_hand';
const MSG_LOWER_HAND = 'lower_hand';
const MSG_EMOJI      = 'emoji_react';

// ─── MeetingRoom ─────────────────────────────────────────────────────────────

export default function MeetingRoom({ token, serverUrl, roomName, roomId, participantName, onLeave }: Props) {
  const [showParticipants, setShowParticipants] = useState(false);
  const [showBgSelector, setShowBgSelector]     = useState(false);
  const [showTranscript, setShowTranscript]     = useState(false);
  const [showQr, setShowQr]                     = useState(false);
  const [showEmojis, setShowEmojis]             = useState(false);
  const [participantCount, setParticipantCount] = useState(0);
  const [copied, setCopied]                     = useState(false);
  const { isRecording, startRecording, stopRecording } = useRecording();

  async function copyRoomId() {
    await navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function openPanel(panel: 'participants' | 'bg' | 'transcript') {
    setShowParticipants(panel === 'participants' ? (v => !v) : false);
    setShowBgSelector(panel === 'bg' ? (v => !v) : false);
    setShowTranscript(panel === 'transcript' ? (v => !v) : false);
  }

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <header className="flex items-center justify-between px-4 py-2 bg-panel border-b border-purple-900 shrink-0">
        <div className="flex items-center gap-2">
          <Video className="w-4 h-4 text-purple-400" />
          <span className="text-white font-semibold">{roomName}</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              isRecording
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-surface hover:bg-card text-gray-400 border border-purple-900 hover:text-white'
            )}
          >
            {isRecording
              ? <><Square className="w-3 h-3 fill-current" /> 録画停止</>
              : <><Circle className="w-3 h-3 fill-red-500 text-red-500" /> 録画</>}
          </button>

          <button
            onClick={() => openPanel('transcript')}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              showTranscript
                ? 'bg-purple-600 text-white'
                : 'bg-surface hover:bg-card text-gray-400 border border-purple-900 hover:text-white'
            )}
          >
            <FileText className="w-3.5 h-3.5" /> 文字起こし
          </button>

          <button
            onClick={() => openPanel('bg')}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              showBgSelector
                ? 'bg-purple-600 text-white'
                : 'bg-surface hover:bg-card text-gray-400 border border-purple-900 hover:text-white'
            )}
          >
            <ImageIcon className="w-3.5 h-3.5" /> 背景
          </button>

          <button
            onClick={() => openPanel('participants')}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              showParticipants
                ? 'bg-purple-600 text-white'
                : 'bg-surface hover:bg-card text-gray-400 border border-purple-900 hover:text-white'
            )}
          >
            <Users className="w-3.5 h-3.5" /> {participantCount}
          </button>

          <button
            onClick={() => setShowQr(v => !v)}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              showQr
                ? 'bg-purple-600 text-white'
                : 'bg-surface hover:bg-card text-gray-400 border border-purple-900 hover:text-white'
            )}
          >
            <QrCode className="w-3.5 h-3.5" /> QR
          </button>

          <button
            onClick={copyRoomId}
            className={clsx(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-mono transition-colors',
              copied
                ? 'bg-green-800 text-green-300'
                : 'bg-surface hover:bg-card text-gray-400 border border-purple-900 hover:text-white'
            )}
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'コピーしました' : roomId}
          </button>
        </div>
      </header>

      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <LiveKitRoom
          video={true}
          audio={true}
          token={token}
          serverUrl={serverUrl}
          data-lk-theme="default"
          onDisconnected={onLeave}
          style={{ height: '100%' }}
        >
          <VideoConference />
          <RoomSideEffects
            participantName={participantName}
            roomId={roomId}
            showParticipants={showParticipants}
            showBgSelector={showBgSelector}
            showTranscript={showTranscript}
            showQr={showQr}
            showEmojis={showEmojis}
            onCountChange={setParticipantCount}
            onClosePanel={() => setShowParticipants(false)}
            onCloseBg={() => setShowBgSelector(false)}
            onCloseTranscript={() => setShowTranscript(false)}
            onCloseQr={() => setShowQr(false)}
            onToggleEmojis={() => setShowEmojis(v => !v)}
            onCloseEmojis={() => setShowEmojis(false)}
          />
        </LiveKitRoom>
      </div>
    </div>
  );
}

// ─── RoomSideEffects ─────────────────────────────────────────────────────────

function RoomSideEffects({
  participantName,
  roomId,
  showParticipants,
  showBgSelector,
  showTranscript,
  showQr,
  showEmojis,
  onCountChange,
  onClosePanel,
  onCloseBg,
  onCloseTranscript,
  onCloseQr,
  onToggleEmojis,
  onCloseEmojis,
}: {
  participantName: string;
  roomId: string;
  showParticipants: boolean;
  showBgSelector: boolean;
  showTranscript: boolean;
  showQr: boolean;
  showEmojis: boolean;
  onCountChange: (n: number) => void;
  onClosePanel: () => void;
  onCloseBg: () => void;
  onCloseTranscript: () => void;
  onCloseQr: () => void;
  onToggleEmojis: () => void;
  onCloseEmojis: () => void;
}) {
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();
  const room = useRoomContext();

  const [raisedHands, setRaisedHands] = useState<Set<string>>(new Set());
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);
  const [myHandRaised, setMyHandRaised] = useState(false);

  useEffect(() => { onCountChange(participants.length); }, [participants.length]);

  useDataChannel((msg) => {
    const text = new TextDecoder().decode(msg.payload);
    const from = msg.from?.identity ?? 'unknown';
    if (msg.topic === MSG_RAISE_HAND) {
      setRaisedHands(prev => new Set(prev).add(from));
    } else if (msg.topic === MSG_LOWER_HAND) {
      setRaisedHands(prev => { const s = new Set(prev); s.delete(from); return s; });
    } else if (msg.topic === MSG_EMOJI) {
      addFloatingEmoji(text);
    }
  });

  function addFloatingEmoji(emoji: string) {
    const id = `${Date.now()}-${Math.random()}`;
    const x = 10 + Math.random() * 80;
    setFloatingEmojis(prev => [...prev, { id, emoji, x }]);
    setTimeout(() => setFloatingEmojis(prev => prev.filter(e => e.id !== id)), 2800);
  }

  function sendRaiseHand() {
    const next = !myHandRaised;
    setMyHandRaised(next);
    const topic = next ? MSG_RAISE_HAND : MSG_LOWER_HAND;
    room.localParticipant.publishData(new TextEncoder().encode(participantName), { topic });
    if (next) setRaisedHands(prev => new Set(prev).add(room.localParticipant.identity));
    else setRaisedHands(prev => { const s = new Set(prev); s.delete(room.localParticipant.identity); return s; });
  }

  function sendEmoji(emoji: string) {
    room.localParticipant.publishData(new TextEncoder().encode(emoji), { topic: MSG_EMOJI });
    addFloatingEmoji(emoji);
  }

  return (
    <>
      {/* Floating emoji animations */}
      <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(0) scale(1); opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(-300px) scale(1.4); opacity: 0; }
        }
      `}</style>

      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 40, overflow: 'hidden' }}>
        {floatingEmojis.map(e => (
          <span key={e.id} style={{
            position: 'absolute', left: `${e.x}%`, bottom: '80px',
            fontSize: '2.5rem', animation: 'floatUp 2.8s ease-out forwards',
          }}>{e.emoji}</span>
        ))}
      </div>

      {/* Raised hand badge */}
      {raisedHands.size > 0 && (
        <div style={{ position: 'absolute', bottom: '80px', left: '12px', zIndex: 25 }}
          className="bg-yellow-500/90 text-black text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
          <Hand className="w-3.5 h-3.5" />
          {[...raisedHands]
            .map(id => participants.find(p => p.identity === id)?.name ?? id)
            .join('、')} が挙手中
        </div>
      )}

      {/* Raise hand + Emoji picker (bottom-right) */}
      <div style={{ position: 'absolute', bottom: '80px', right: '12px', zIndex: 25 }} className="flex flex-col items-end gap-2">
        {showEmojis && (
          <div className="bg-panel border border-purple-900 rounded-2xl p-3 flex gap-2 shadow-2xl">
            {['👍', '😄', '👏', '🎉', '❤️', '😮'].map(emoji => (
              <button key={emoji} onClick={() => { sendEmoji(emoji); onCloseEmojis(); }}
                className="text-2xl hover:scale-125 transition-transform w-10 h-10 flex items-center justify-center rounded-xl hover:bg-purple-900">
                {emoji}
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <button onClick={onToggleEmojis}
            className={clsx('flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium shadow-lg transition-colors',
              showEmojis ? 'bg-purple-600 text-white' : 'bg-panel border border-purple-900 text-gray-300 hover:text-white')}>
            <Smile className="w-4 h-4" />
          </button>
          <button onClick={sendRaiseHand}
            className={clsx('flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium shadow-lg transition-colors',
              myHandRaised ? 'bg-yellow-500 text-black' : 'bg-panel border border-purple-900 text-gray-300 hover:text-white')}>
            <Hand className="w-4 h-4" />
            {myHandRaised ? '手を下げる' : '挙手'}
          </button>
        </div>
      </div>

      {/* Participant panel */}
      {showParticipants && (
        <aside style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '18rem', zIndex: 20 }}
          className="bg-panel border-l border-purple-900 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-purple-900">
            <span className="font-semibold text-white">参加者 ({participants.length})</span>
            <button onClick={onClosePanel} className="text-gray-400 hover:text-white"><X className="w-4 h-4" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {participants.map((p) => {
              const micPub = p.getTrackPublication(Track.Source.Microphone);
              const camPub = p.getTrackPublication(Track.Source.Camera);
              const name = p.name ?? p.identity;
              return (
                <div key={p.identity} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-card transition-colors">
                  <div className="relative w-8 h-8 shrink-0">
                    <div className="w-8 h-8 rounded-full bg-purple-700 flex items-center justify-center text-sm font-bold text-white">
                      {name[0]?.toUpperCase()}
                    </div>
                    {raisedHands.has(p.identity) && (
                      <span className="absolute -top-1 -right-1 text-sm">✋</span>
                    )}
                  </div>
                  <span className="flex-1 text-sm text-white truncate">{name}</span>
                  <div className="flex gap-1.5 shrink-0">
                    {micPub && !micPub.isMuted ? <Mic className="w-3.5 h-3.5 text-green-400" /> : <MicOff className="w-3.5 h-3.5 text-gray-500" />}
                    {camPub && !camPub.isMuted ? <Video className="w-3.5 h-3.5 text-green-400" /> : <VideoOff className="w-3.5 h-3.5 text-gray-500" />}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      )}

      {showBgSelector && <BackgroundSelector localParticipant={localParticipant} onClose={onCloseBg} />}
      {showTranscript && <TranscriptPanel participantName={participantName} onClose={onCloseTranscript} />}
      {showQr && <QrPanel roomId={roomId} onClose={onCloseQr} />}
    </>
  );
}

// ─── QrPanel ─────────────────────────────────────────────────────────────────

function QrPanel({ roomId, onClose }: { roomId: string; onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);

  const url = typeof window !== 'undefined'
    ? `${window.location.origin}/room/${roomId}`
    : '';

  useEffect(() => {
    if (!url || !canvasRef.current) return;
    import('qrcode').then(QRCode => {
      QRCode.toCanvas(canvasRef.current!, url, {
        width: 200,
        margin: 2,
        color: { dark: '#ffffff', light: '#1a1033' },
      });
    });
  }, [url]);

  async function copyUrl() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ position: 'absolute', top: '52px', right: '12px', zIndex: 30, width: '240px' }}
      className="bg-panel border border-purple-900 rounded-2xl shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-purple-900">
        <span className="font-semibold text-white text-sm">QRコードで招待</span>
        <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-4 h-4" /></button>
      </div>
      <div className="flex flex-col items-center gap-3 p-4">
        <canvas ref={canvasRef} className="rounded-xl" />
        <p className="text-xs text-gray-400 text-center break-all">{url}</p>
        <button onClick={copyUrl}
          className={clsx('w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors',
            copied ? 'bg-green-800 text-green-300' : 'bg-surface border border-purple-900 text-gray-300 hover:text-white')}>
          {copied ? <><Check className="w-3 h-3" /> コピーしました</> : <><Copy className="w-3 h-3" /> URLをコピー</>}
        </button>
      </div>
    </div>
  );
}

// ─── TranscriptPanel ─────────────────────────────────────────────────────────

function TranscriptPanel({ participantName, onClose }: { participantName: string; onClose: () => void }) {
  const [isListening, setIsListening] = useState(false);
  const { entries, exportTxt, clearEntries } = useTranscription(participantName, isListening);
  const bottomRef = useRef<HTMLDivElement>(null);

  const isSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [entries.length]);

  return (
    <aside style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '22rem', zIndex: 20 }}
      className="bg-panel border-l border-purple-900 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-purple-900">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-purple-400" />
          <span className="font-semibold text-white">文字起こし</span>
          {isListening && <span className="flex items-center gap-1 text-xs text-red-400"><Circle className="w-2 h-2 fill-red-400" /> REC</span>}
        </div>
        <div className="flex items-center gap-2">
          {entries.filter(e => e.isFinal).length > 0 && (
            <button onClick={exportTxt} className="flex items-center gap-1 text-xs text-gray-400 hover:text-white">
              <Download className="w-3 h-3" /> 保存
            </button>
          )}
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
      </div>
      {!isSupported && (
        <div className="px-4 py-2 text-xs text-yellow-400 bg-yellow-900/20 border-b border-yellow-900/30">
          ⚠️ Chrome または Edge が必要です
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {entries.length === 0
          ? <p className="text-gray-500 text-sm text-center mt-12">{isListening ? '話してください...' : '「開始」を押して文字起こしを始めます'}</p>
          : entries.map(e => (
            <div key={e.id} className={clsx('leading-relaxed', e.isFinal ? 'text-white' : 'text-gray-500 italic')}>
              <span className="text-purple-400 text-xs mr-1 not-italic">{e.timestamp.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
              <span className="text-blue-400 text-xs mr-1 font-medium not-italic">{e.speaker}:</span>
              <span className="text-sm">{e.text}</span>
            </div>
          ))
        }
        <div ref={bottomRef} />
      </div>
      <div className="px-3 py-3 border-t border-purple-900 flex gap-2">
        <button onClick={() => setIsListening(v => !v)} disabled={!isSupported}
          className={clsx('flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-40',
            isListening ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white')}>
          {isListening ? <><Square className="w-3 h-3 fill-current" /> 停止</> : <><Mic className="w-3.5 h-3.5" /> 開始</>}
        </button>
        {entries.length > 0 && (
          <button onClick={clearEntries} className="px-3 py-2.5 rounded-lg border border-purple-900 text-gray-400 hover:text-white text-sm">クリア</button>
        )}
      </div>
    </aside>
  );
}

// ─── useTranscription ────────────────────────────────────────────────────────

function useTranscription(speakerName: string, enabled: boolean) {
  const [entries, setEntries] = useState<TranscriptEntry[]>([]);
  const interimIdRef = useRef('');
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  useEffect(() => {
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    if (!SR || !enabled) return;
    const recognition = new SR();
    recognition.lang = 'ja-JP';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript.trim();
        if (!text) continue;
        if (result.isFinal) {
          const removedId = interimIdRef.current;
          interimIdRef.current = '';
          setEntries(prev => [...prev.filter(e => e.id !== removedId),
            { id: `${Date.now()}`, speaker: speakerName, text, timestamp: new Date(), isFinal: true }]);
        } else {
          if (!interimIdRef.current) interimIdRef.current = `interim-${Date.now()}`;
          const id = interimIdRef.current;
          setEntries(prev => [...prev.filter(e => e.id !== id),
            { id, speaker: speakerName, text, timestamp: new Date(), isFinal: false }]);
        }
      }
    };
    recognition.onend = () => { if (enabledRef.current) { try { recognition.start(); } catch {} } };
    recognition.onerror = (e: any) => { if (e.error !== 'no-speech' && e.error !== 'aborted') console.warn('SR:', e.error); };
    recognition.start();
    return () => { recognition.onend = null; recognition.stop(); };
  }, [enabled, speakerName]);

  function exportTxt() {
    const lines = entries.filter(e => e.isFinal)
      .map(e => `[${e.timestamp.toLocaleTimeString('ja-JP')}] ${e.speaker}: ${e.text}`).join('\n');
    const blob = new Blob([lines], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), { href: url, download: `transcript-${new Date().toISOString().slice(0, 10)}.txt` });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return { entries, exportTxt, clearEntries: () => setEntries([]) };
}

// ─── BackgroundSelector ──────────────────────────────────────────────────────

type BgMode = 'none' | 'blur-low' | 'blur-mid' | 'blur-high' | 'bg-office' | 'bg-nature' | 'bg-space' | 'bg-sunset';

const BG_OPTIONS: { id: BgMode; label: string; preview: string }[] = [
  { id: 'none',      label: 'なし',      preview: 'bg-gray-800' },
  { id: 'blur-low',  label: 'ぼかし弱',  preview: 'bg-gradient-to-br from-gray-600 to-gray-800' },
  { id: 'blur-mid',  label: 'ぼかし中',  preview: 'bg-gradient-to-br from-gray-500 to-gray-700' },
  { id: 'blur-high', label: 'ぼかし強',  preview: 'bg-gradient-to-br from-gray-400 to-gray-600' },
  { id: 'bg-office', label: 'オフィス',  preview: 'bg-gradient-to-br from-blue-950 to-blue-700' },
  { id: 'bg-nature', label: '自然',      preview: 'bg-gradient-to-br from-green-950 to-emerald-600' },
  { id: 'bg-space',  label: '宇宙',      preview: 'bg-gradient-to-br from-indigo-950 to-purple-900' },
  { id: 'bg-sunset', label: 'サンセット', preview: 'bg-gradient-to-br from-orange-600 to-pink-800' },
];

const BG_GRADIENTS: Record<string, { stops: [number, string][]; angle: number }> = {
  'bg-office': { angle: 145, stops: [[0, '#0a1628'], [0.4, '#1a3a6b'], [1, '#0d2545']] },
  'bg-nature': { angle: 160, stops: [[0, '#0a1f0f'], [0.4, '#1a5c35'], [0.7, '#2d8a50'], [1, '#0d2b1a']] },
  'bg-space':  { angle: 135, stops: [[0, '#040410'], [0.3, '#0e0828'], [0.7, '#1a0840'], [1, '#040410']] },
  'bg-sunset': { angle: 170, stops: [[0, '#1a0533'], [0.3, '#6b2d5e'], [0.6, '#d4546a'], [1, '#f7a441']] },
};

function createGradientDataUrl(key: string): string {
  const { angle, stops } = BG_GRADIENTS[key];
  const canvas = document.createElement('canvas');
  canvas.width = 1280; canvas.height = 720;
  const ctx = canvas.getContext('2d')!;
  const rad = (angle * Math.PI) / 180;
  const dist = Math.hypot(640, 360);
  const grad = ctx.createLinearGradient(
    640 - Math.cos(rad) * dist, 360 - Math.sin(rad) * dist,
    640 + Math.cos(rad) * dist, 360 + Math.sin(rad) * dist,
  );
  stops.forEach(([pos, color]) => grad.addColorStop(pos, color));
  ctx.fillStyle = grad; ctx.fillRect(0, 0, 1280, 720);
  return canvas.toDataURL('image/jpeg', 0.95);
}

function BackgroundSelector({ localParticipant, onClose }: {
  localParticipant: ReturnType<typeof useLocalParticipant>['localParticipant'];
  onClose: () => void;
}) {
  const [active, setActive] = useState<BgMode>('none');
  const [loading, setLoading] = useState(false);

  async function apply(mode: BgMode) {
    const pub = localParticipant.getTrackPublication(Track.Source.Camera);
    const track = pub?.track as LocalVideoTrack | undefined;
    if (!track) return;
    setLoading(true);
    try {
      const opts = { delegate: 'GPU' as const };
      if (mode === 'none') await track.stopProcessor();
      else if (mode.startsWith('blur')) {
        const radius = mode === 'blur-low' ? 8 : mode === 'blur-mid' ? 18 : 30;
        await track.setProcessor(BackgroundBlur(radius, opts));
      } else {
        await track.setProcessor(VirtualBackground(createGradientDataUrl(mode), opts));
      }
      setActive(mode);
    } catch (e) { console.error('Background error:', e); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ position: 'absolute', bottom: '72px', right: '16px', width: '280px', zIndex: 30 }}
      className="bg-panel border border-purple-900 rounded-xl shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-purple-900">
        <span className="font-semibold text-white text-sm">バーチャル背景</span>
        <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-4 h-4" /></button>
      </div>
      {loading && (
        <div className="flex items-center justify-center gap-2 py-2 text-purple-400 text-xs border-b border-purple-900">
          <Loader2 className="w-3 h-3 animate-spin" /> 適用中...
        </div>
      )}
      <div className="grid grid-cols-3 gap-2 p-3">
        {BG_OPTIONS.map((opt) => (
          <button key={opt.id} onClick={() => apply(opt.id)} disabled={loading}
            className={clsx('flex flex-col items-center gap-1.5 rounded-lg p-1 transition-all disabled:opacity-50',
              active === opt.id ? 'ring-2 ring-purple-500 ring-offset-1 ring-offset-panel' : 'hover:bg-card')}>
            <div className={clsx('w-full h-14 rounded-md relative overflow-hidden', opt.preview)}>
              {opt.id === 'none' && <div className="absolute inset-0 flex items-center justify-center"><Video className="w-5 h-5 text-gray-500" /></div>}
              {opt.id.startsWith('blur') && <div className="absolute inset-0 backdrop-blur-sm flex items-center justify-center"><div className="w-6 h-6 rounded-full bg-gray-500 opacity-60" /></div>}
            </div>
            <span className="text-xs text-gray-300">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── useRecording ─────────────────────────────────────────────────────────────

function useRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true, preferCurrentTab: true } as any);
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm';
      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = Object.assign(document.createElement('a'), {
          href: url, download: `meeting-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`,
        });
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        URL.revokeObjectURL(url);
        stream.getTracks().forEach(t => t.stop());
        setIsRecording(false);
      };
      stream.getVideoTracks()[0].addEventListener('ended', () => { if (recorder.state !== 'inactive') recorder.stop(); });
      recorder.start(1000);
      recorderRef.current = recorder;
      setIsRecording(true);
    } catch { /* cancelled */ }
  }

  return { isRecording, startRecording, stopRecording: () => recorderRef.current?.stop() };
}
