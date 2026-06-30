'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Video, Users, Lock, ArrowRight, Loader2, LayoutDashboard } from 'lucide-react';
import { createRoom, getRoom } from '@/lib/api';
import { createClient } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

type Mode = 'home' | 'create' | 'join';

export default function HomePage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('home');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null;
      setUser(u);
      if (u?.user_metadata?.full_name) {
        setCreateHost(u.user_metadata.full_name);
        setJoinName(u.user_metadata.full_name);
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u?.user_metadata?.full_name) {
        setCreateHost(u.user_metadata.full_name);
        setJoinName(u.user_metadata.full_name);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // create form
  const [createName, setCreateName] = useState('');
  const [createHost, setCreateHost] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [joinName, setJoinName] = useState('');
  const [joinRoomId, setJoinRoomId] = useState('');

  // join form

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const room = await createRoom({
        name: createName,
        hostName: createHost,
        password: createPassword || undefined,
        userId: user?.id,
      });
      router.push(`/room/${room.room_id}?name=${encodeURIComponent(createHost)}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await getRoom(joinRoomId.trim());
      router.push(
        `/room/${joinRoomId.trim()}?name=${encodeURIComponent(joinName)}`
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'ルームが見つかりません');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-3">
            <Video className="w-8 h-8 text-purple-400" />
            <span className="text-3xl font-bold text-white">HASHi</span>
          </div>
          <p className="text-gray-400">つながる、広がる、オンライン会議</p>

          {user ? (
            <div className="flex items-center justify-center gap-3 mt-4">
              {user.user_metadata?.avatar_url && (
                <img src={user.user_metadata.avatar_url} className="w-7 h-7 rounded-full" alt="avatar" />
              )}
              <span className="text-sm text-gray-300">{user.user_metadata?.full_name ?? user.email}</span>
              <Link href="/dashboard" className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors">
                <LayoutDashboard className="w-3.5 h-3.5" /> マイルーム
              </Link>
            </div>
          ) : (
            <Link href="/auth" className="inline-block mt-4 text-sm text-purple-400 hover:text-purple-300 underline underline-offset-2 transition-colors">
              ログインしてマイルームを使う
            </Link>
          )}
        </div>

        {mode === 'home' && (
          <div className="space-y-4">
            <button
              onClick={() => setMode('create')}
              className="w-full flex items-center justify-between bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <Video className="w-5 h-5" />
                <span>新しい会議を開始</span>
              </div>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => setMode('join')}
              className="w-full flex items-center justify-between bg-panel hover:bg-card text-white font-semibold py-4 px-6 rounded-xl border border-purple-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5" />
                <span>会議に参加</span>
              </div>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {mode === 'create' && (
          <form onSubmit={handleCreate} className="bg-panel rounded-2xl p-6 border border-purple-900 space-y-4">
            <h2 className="text-xl font-bold text-white mb-2">新しい会議を作成</h2>

            <div>
              <label className="block text-sm text-gray-400 mb-1">会議名</label>
              <input
                type="text"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="例: チームミーティング"
                required
                className="w-full bg-surface border border-purple-800 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">あなたの名前</label>
              <input
                type="text"
                value={createHost}
                onChange={(e) => setCreateHost(e.target.value)}
                placeholder="例: 田中 太郎"
                required
                className="w-full bg-surface border border-purple-800 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">
                <Lock className="inline w-3 h-3 mr-1" />
                パスワード（任意）
              </label>
              <input
                type="password"
                value={createPassword}
                onChange={(e) => setCreatePassword(e.target.value)}
                placeholder="設定しない場合は空白"
                className="w-full bg-surface border border-purple-800 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500"
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setMode('home'); setError(''); }}
                className="flex-1 py-3 rounded-lg border border-purple-800 text-gray-400 hover:text-white transition-colors"
              >
                戻る
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                作成して参加
              </button>
            </div>
          </form>
        )}

        {mode === 'join' && (
          <form onSubmit={handleJoin} className="bg-panel rounded-2xl p-6 border border-purple-900 space-y-4">
            <h2 className="text-xl font-bold text-white mb-2">会議に参加</h2>

            <div>
              <label className="block text-sm text-gray-400 mb-1">ミーティングID</label>
              <input
                type="text"
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value)}
                placeholder="例: a1b2c3d4e5"
                required
                className="w-full bg-surface border border-purple-800 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">あなたの名前</label>
              <input
                type="text"
                value={joinName}
                onChange={(e) => setJoinName(e.target.value)}
                placeholder="例: 山田 花子"
                required
                className="w-full bg-surface border border-purple-800 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500"
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setMode('home'); setError(''); }}
                className="flex-1 py-3 rounded-lg border border-purple-800 text-gray-400 hover:text-white transition-colors"
              >
                戻る
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                参加する
              </button>
            </div>
          </form>
        )}
        <div className="mt-10 text-center text-xs text-gray-600 space-x-3">
          <Link href="/help" className="hover:text-gray-400 transition-colors">使い方</Link>
          <span>·</span>
          <Link href="/terms" className="hover:text-gray-400 transition-colors">利用規約</Link>
          <span>·</span>
          <Link href="/privacy" className="hover:text-gray-400 transition-colors">プライバシーポリシー</Link>
          <span>·</span>
          <Link href="/contact" className="hover:text-gray-400 transition-colors">お問い合わせ</Link>
          <span>·</span>
          <Link href="/changelog" className="hover:text-gray-400 transition-colors">更新履歴</Link>
        </div>
      </div>
    </main>
  );
}
