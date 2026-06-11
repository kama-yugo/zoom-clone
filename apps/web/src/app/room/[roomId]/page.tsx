'use client';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Loader2, Lock, Video } from 'lucide-react';
import { getRoom, getToken, RoomInfo, TokenResponse } from '@/lib/api';
import MeetingRoom from '@/components/MeetingRoom';
import PreJoinScreen from '@/components/PreJoinScreen';

type Stage = 'loading' | 'password' | 'prejoin' | 'connecting' | 'meeting' | 'error';

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const participantName = searchParams.get('name') ?? 'Guest';

  const [stage, setStage] = useState<Stage>('loading');
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [tokenData, setTokenData] = useState<TokenResponse | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // On mount: fetch room info
  useEffect(() => {
    async function init() {
      try {
        const info = await getRoom(roomId);
        setRoomInfo(info);

        if (info.has_password) {
          setStage('password');
        } else {
          setStage('prejoin');
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'ルームが見つかりません');
        setStage('error');
      }
    }
    init();
  }, [roomId]);

  async function fetchToken(rid: string, name: string, pwd?: string) {
    setStage('connecting');
    try {
      const data = await getToken({ roomId: rid, participantName: name, password: pwd });
      setTokenData(data);
      setStage('meeting');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'トークンの取得に失敗しました');
      setStage(roomInfo?.has_password ? 'password' : 'error');
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    // After password verified, show prejoin
    setStage('connecting');
    try {
      const data = await getToken({ roomId, participantName: participantName, password });
      setTokenData(data);
      setStage('prejoin');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'パスワードが違います');
      setStage('password');
    }
  }

  async function handlePrejoinJoin() {
    if (tokenData) { setStage('meeting'); return; }
    await fetchToken(roomId, participantName);
  }

  if (stage === 'prejoin' && roomInfo) {
    return (
      <PreJoinScreen
        roomName={roomInfo.name}
        participantName={participantName}
        onJoin={handlePrejoinJoin}
      />
    );
  }

  if (stage === 'loading' || stage === 'connecting') {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">
            {stage === 'loading' ? 'ルームを確認中...' : '接続中...'}
          </p>
        </div>
      </div>
    );
  }

  if (stage === 'error') {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="bg-panel rounded-2xl p-8 border border-red-900 max-w-sm w-full text-center">
          <p className="text-red-400 text-lg mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="w-full py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  if (stage === 'password') {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <form
          onSubmit={handlePasswordSubmit}
          className="bg-panel rounded-2xl p-8 border border-purple-900 max-w-sm w-full"
        >
          <div className="flex items-center gap-3 mb-6">
            <Video className="w-6 h-6 text-purple-400" />
            <div>
              <h2 className="text-white font-bold text-lg">{roomInfo?.name}</h2>
              <p className="text-gray-400 text-sm">パスワードが必要です</p>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-1">
              <Lock className="inline w-3 h-3 mr-1" />
              パスワード
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              required
              className="w-full bg-surface border border-purple-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold"
          >
            参加する
          </button>
        </form>
      </div>
    );
  }

  if (stage === 'meeting' && tokenData) {
    return (
      <MeetingRoom
        token={tokenData.token}
        serverUrl={tokenData.liveKitUrl}
        roomName={tokenData.roomName}
        participantName={participantName}
        roomId={roomId}
        onLeave={() => router.push('/')}
      />
    );
  }

  return null;
}
