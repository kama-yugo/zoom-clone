'use client';
import { useEffect, useRef, useState } from 'react';
import { Loader2, Mic, MicOff, Video, VideoOff, ArrowRight } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  roomName: string;
  participantName: string;
  onJoin: (camOn: boolean, micOn: boolean) => void;
}

export default function PreJoinScreen({ roomName, participantName, onJoin }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animRef = useRef<number>(0);

  const [camOn, setCamOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [micLevel, setMicLevel] = useState(0);
  const [permissionError, setPermissionError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    startPreview(true, true);
    return () => stopPreview();
  }, []);

  async function startPreview(cam: boolean, mic: boolean) {
    stopPreview();
    setLoading(true);
    setPermissionError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: cam,
        audio: mic,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      if (mic) setupMicMeter(stream);
    } catch {
      setPermissionError('カメラ・マイクへのアクセスが拒否されました。ブラウザの設定を確認してください。');
    } finally {
      setLoading(false);
    }
  }

  function stopPreview() {
    cancelAnimationFrame(animRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    analyserRef.current = null;
    setMicLevel(0);
  }

  function setupMicMeter(stream: MediaStream) {
    const ctx = new AudioContext();
    const src = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    src.connect(analyser);
    analyserRef.current = analyser;
    const data = new Uint8Array(analyser.frequencyBinCount);

    function tick() {
      analyser.getByteFrequencyData(data);
      const avg = data.reduce((a, b) => a + b, 0) / data.length;
      setMicLevel(Math.min(100, avg * 2));
      animRef.current = requestAnimationFrame(tick);
    }
    tick();
  }

  async function toggleCam() {
    const next = !camOn;
    setCamOn(next);
    await startPreview(next, micOn);
  }

  async function toggleMic() {
    const next = !micOn;
    setMicOn(next);
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(t => { t.enabled = next; });
      if (next) setupMicMeter(streamRef.current);
      else { cancelAnimationFrame(animRef.current); setMicLevel(0); }
    }
  }

  function handleJoin() {
    stopPreview();
    onJoin(camOn, micOn);
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-white">{roomName}</h1>
          <p className="text-gray-400 text-sm mt-1">{participantName} として参加</p>
        </div>

        {/* Camera preview */}
        <div className="relative bg-black rounded-2xl overflow-hidden aspect-video mb-4">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
            </div>
          )}
          {!camOn && !loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <div className="w-16 h-16 rounded-full bg-purple-800 flex items-center justify-center text-2xl font-bold text-white">
                {participantName[0]?.toUpperCase()}
              </div>
              <span className="text-gray-400 text-sm">カメラオフ</span>
            </div>
          )}
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className={clsx('w-full h-full object-cover scale-x-[-1]', (!camOn || loading) && 'invisible')}
          />
        </div>

        {permissionError && (
          <p className="text-red-400 text-sm text-center mb-4">{permissionError}</p>
        )}

        {/* Mic level */}
        <div className="flex items-center gap-2 mb-4 px-1">
          <Mic className="w-3.5 h-3.5 text-gray-500 shrink-0" />
          <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-75"
              style={{ width: `${micLevel}%` }}
            />
          </div>
          {!micOn && <span className="text-xs text-gray-500">ミュート中</span>}
        </div>

        {/* Controls */}
        <div className="flex gap-3 mb-5">
          <button
            onClick={toggleCam}
            className={clsx(
              'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors text-sm',
              camOn
                ? 'bg-panel border border-purple-900 text-white hover:bg-card'
                : 'bg-red-900/60 border border-red-800 text-red-300 hover:bg-red-900'
            )}
          >
            {camOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
            {camOn ? 'カメラオン' : 'カメラオフ'}
          </button>
          <button
            onClick={toggleMic}
            className={clsx(
              'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors text-sm',
              micOn
                ? 'bg-panel border border-purple-900 text-white hover:bg-card'
                : 'bg-red-900/60 border border-red-800 text-red-300 hover:bg-red-900'
            )}
          >
            {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            {micOn ? 'マイクオン' : 'ミュート'}
          </button>
        </div>

        <button
          onClick={handleJoin}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-base transition-colors"
        >
          参加する <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
