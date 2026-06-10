'use client';
import { useEffect, useRef, useState } from 'react';
import {
  LiveKitRoom,
  VideoConference,
  useParticipants,
  useLocalParticipant,
} from '@livekit/components-react';
import { LocalVideoTrack, Participant, Track } from 'livekit-client';
import { BackgroundBlur, VirtualBackground } from '@livekit/track-processors';
import clsx from 'clsx';
import {
  Check,
  Circle,
  Copy,
  ImageIcon,
  Loader2,
  Mic,
  MicOff,
  Square,
  Users,
  Video,
  VideoOff,
  X,
} from 'lucide-react';

interface Props {
  token: string;
  serverUrl: string;
  roomName: string;
  participantName: string;
  roomId: string;
  onLeave: () => void;
}

export default function MeetingRoom({ token, serverUrl, roomName, roomId, onLeave }: Props) {
  const [showParticipants, setShowParticipants] = useState(false);
  const [showBgSelector, setShowBgSelector] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const { isRecording, startRecording, stopRecording } = useRecording();

  async function copyRoomId() {
    await navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function toggleParticipants() {
    setShowParticipants(v => !v);
    setShowBgSelector(false);
  }

  function toggleBgSelector() {
    setShowBgSelector(v => !v);
    setShowParticipants(false);
  }

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <header className="flex items-center justify-between px-4 py-2 bg-panel border-b border-purple-900 shrink-0">
        <div className="flex items-center gap-2">
          <Video className="w-4 h-4 text-purple-400" />
          <span className="text-white font-semibold">{roomName}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Recording */}
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

          {/* Virtual background */}
          <button
            onClick={toggleBgSelector}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              showBgSelector
                ? 'bg-purple-600 text-white'
                : 'bg-surface hover:bg-card text-gray-400 border border-purple-900 hover:text-white'
            )}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>背景</span>
          </button>

          {/* Participants */}
          <button
            onClick={toggleParticipants}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              showParticipants
                ? 'bg-purple-600 text-white'
                : 'bg-surface hover:bg-card text-gray-400 border border-purple-900 hover:text-white'
            )}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{participantCount}</span>
          </button>

          {/* Room ID copy */}
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
            showParticipants={showParticipants}
            showBgSelector={showBgSelector}
            onCountChange={setParticipantCount}
            onClosePanel={() => setShowParticipants(false)}
            onCloseBg={() => setShowBgSelector(false)}
          />
        </LiveKitRoom>
      </div>
    </div>
  );
}

function RoomSideEffects({
  showParticipants,
  showBgSelector,
  onCountChange,
  onClosePanel,
  onCloseBg,
}: {
  showParticipants: boolean;
  showBgSelector: boolean;
  onCountChange: (n: number) => void;
  onClosePanel: () => void;
  onCloseBg: () => void;
}) {
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();

  useEffect(() => {
    onCountChange(participants.length);
  }, [participants.length]);

  return (
    <>
      {showParticipants && (
        <aside
          style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '18rem', zIndex: 20 }}
          className="bg-panel border-l border-purple-900 flex flex-col"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-purple-900">
            <span className="font-semibold text-white">参加者 ({participants.length})</span>
            <button onClick={onClosePanel} className="text-gray-400 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {participants.map((p) => {
              const micPub = p.getTrackPublication(Track.Source.Microphone);
              const camPub = p.getTrackPublication(Track.Source.Camera);
              const isMicOn = micPub ? !micPub.isMuted : false;
              const isCamOn = camPub ? !camPub.isMuted : false;
              const displayName = p.name ?? p.identity;
              return (
                <div key={p.identity} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-card transition-colors">
                  <div className="w-8 h-8 rounded-full bg-purple-700 flex items-center justify-center text-sm font-bold text-white shrink-0">
                    {displayName[0]?.toUpperCase() ?? '?'}
                  </div>
                  <span className="flex-1 text-sm text-white truncate">{displayName}</span>
                  <div className="flex gap-1.5 shrink-0">
                    {isMicOn ? <Mic className="w-3.5 h-3.5 text-green-400" /> : <MicOff className="w-3.5 h-3.5 text-gray-500" />}
                    {isCamOn ? <Video className="w-3.5 h-3.5 text-green-400" /> : <VideoOff className="w-3.5 h-3.5 text-gray-500" />}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      )}

      {showBgSelector && (
        <BackgroundSelector
          localParticipant={localParticipant}
          onClose={onCloseBg}
        />
      )}
    </>
  );
}

// ─── Background types ────────────────────────────────────────────────────────

type BgMode = 'none' | 'blur-low' | 'blur-mid' | 'blur-high' | 'bg-office' | 'bg-nature' | 'bg-space';

const BG_OPTIONS: { id: BgMode; label: string; preview: string }[] = [
  { id: 'none',      label: 'なし',    preview: 'bg-gray-800' },
  { id: 'blur-low',  label: 'ぼかし弱', preview: 'bg-gradient-to-br from-gray-600 to-gray-800' },
  { id: 'blur-mid',  label: 'ぼかし中', preview: 'bg-gradient-to-br from-gray-500 to-gray-700' },
  { id: 'blur-high', label: 'ぼかし強', preview: 'bg-gradient-to-br from-gray-400 to-gray-600' },
  { id: 'bg-office', label: 'オフィス', preview: 'bg-gradient-to-br from-blue-900 to-blue-700' },
  { id: 'bg-nature', label: '自然',    preview: 'bg-gradient-to-br from-green-800 to-emerald-600' },
  { id: 'bg-space',  label: '宇宙',    preview: 'bg-gradient-to-br from-indigo-900 to-purple-900' },
];

// Solid-color virtual background images (generated via canvas)
const BG_COLORS: Record<string, string> = {
  'bg-office': '#1e3a5f',
  'bg-nature': '#1a4731',
  'bg-space':  '#0f0c29',
};

function BackgroundSelector({
  localParticipant,
  onClose,
}: {
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
      if (mode === 'none') {
        await track.stopProcessor();
      } else if (mode.startsWith('blur')) {
        const radius = mode === 'blur-low' ? 5 : mode === 'blur-mid' ? 15 : 25;
        await track.setProcessor(BackgroundBlur(radius));
      } else {
        // Generate a solid-color background as a data URL
        const color = BG_COLORS[mode] ?? '#1a1a2e';
        const canvas = document.createElement('canvas');
        canvas.width = 1280;
        canvas.height = 720;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, 1280, 720);
        const dataUrl = canvas.toDataURL('image/jpeg');
        await track.setProcessor(VirtualBackground(dataUrl));
      }
      setActive(mode);
    } catch (e) {
      console.error('Background error:', e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '72px',
        right: '16px',
        width: '280px',
        zIndex: 30,
      }}
      className="bg-panel border border-purple-900 rounded-xl shadow-2xl overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-purple-900">
        <span className="font-semibold text-white text-sm">バーチャル背景</span>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-2 text-purple-400 text-xs border-b border-purple-900">
          <Loader2 className="w-3 h-3 animate-spin" /> 適用中...
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 p-3">
        {BG_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => apply(opt.id)}
            disabled={loading}
            className={clsx(
              'flex flex-col items-center gap-1.5 rounded-lg p-1 transition-all disabled:opacity-50',
              active === opt.id
                ? 'ring-2 ring-purple-500 ring-offset-1 ring-offset-panel'
                : 'hover:bg-card'
            )}
          >
            <div className={clsx('w-full h-14 rounded-md', opt.preview, 'relative overflow-hidden')}>
              {opt.id === 'none' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Video className="w-5 h-5 text-gray-500" />
                </div>
              )}
              {opt.id.startsWith('blur') && (
                <div className="absolute inset-0 backdrop-blur-sm flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-gray-500 opacity-60" />
                </div>
              )}
            </div>
            <span className="text-xs text-gray-300">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Recording hook ───────────────────────────────────────────────────────────

function useRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
        // @ts-ignore
        preferCurrentTab: true,
      });
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';
      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `meeting-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        stream.getTracks().forEach((t) => t.stop());
        setIsRecording(false);
      };
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        if (recorder.state !== 'inactive') recorder.stop();
      });
      recorder.start(1000);
      recorderRef.current = recorder;
      setIsRecording(true);
    } catch {
      // cancelled
    }
  }

  function stopRecording() { recorderRef.current?.stop(); }

  return { isRecording, startRecording, stopRecording };
}
