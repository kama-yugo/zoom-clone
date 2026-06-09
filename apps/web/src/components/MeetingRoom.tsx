'use client';
import { useEffect, useRef, useState } from 'react';
import {
  LiveKitRoom,
  VideoConference,
  useParticipants,
} from '@livekit/components-react';
import { Participant, Track } from 'livekit-client';
import clsx from 'clsx';
import {
  Check,
  Circle,
  Copy,
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
  const [participantCount, setParticipantCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const { isRecording, startRecording, stopRecording } = useRecording();

  async function copyRoomId() {
    await navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column' }}>
      {/* Header — outside LiveKitRoom so layout is stable */}
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

          {/* Participants toggle */}
          <button
            onClick={() => setShowParticipants(v => !v)}
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

      {/* LiveKit room — fills remaining height */}
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
          {/* VideoConference fills full height; panel overlays on top */}
          <VideoConference />
          <RoomSideEffects
            showParticipants={showParticipants}
            onCountChange={setParticipantCount}
            onClosePanel={() => setShowParticipants(false)}
          />
        </LiveKitRoom>
      </div>
    </div>
  );
}

// Must be inside LiveKitRoom to use hooks; renders the overlay panel
function RoomSideEffects({
  showParticipants,
  onCountChange,
  onClosePanel,
}: {
  showParticipants: boolean;
  onCountChange: (n: number) => void;
  onClosePanel: () => void;
}) {
  const participants = useParticipants();

  useEffect(() => {
    onCountChange(participants.length);
  }, [participants.length]);

  if (!showParticipants) return null;

  return (
    // Absolute overlay — does not affect VideoConference height/layout
    <aside
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: '18rem',
        zIndex: 20,
      }}
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
            <div
              key={p.identity}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-card transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-purple-700 flex items-center justify-center text-sm font-bold text-white shrink-0">
                {displayName[0]?.toUpperCase() ?? '?'}
              </div>
              <span className="flex-1 text-sm text-white truncate">{displayName}</span>
              <div className="flex gap-1.5 shrink-0">
                {isMicOn
                  ? <Mic className="w-3.5 h-3.5 text-green-400" />
                  : <MicOff className="w-3.5 h-3.5 text-gray-500" />}
                {isCamOn
                  ? <Video className="w-3.5 h-3.5 text-green-400" />
                  : <VideoOff className="w-3.5 h-3.5 text-gray-500" />}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}

function useRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
        // @ts-ignore — Chrome: pre-selects the current tab in the share dialog
        preferCurrentTab: true,
      });

      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';

      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

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

      // Stop gracefully when user closes the browser share UI
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        if (recorder.state !== 'inactive') recorder.stop();
      });

      recorder.start(1000);
      recorderRef.current = recorder;
      setIsRecording(true);
    } catch {
      // User cancelled the dialog
    }
  }

  function stopRecording() {
    recorderRef.current?.stop();
  }

  return { isRecording, startRecording, stopRecording };
}
