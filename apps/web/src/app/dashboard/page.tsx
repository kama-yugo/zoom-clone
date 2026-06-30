'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, LogOut, Plus, Video, ArrowRight, Clock } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

interface MyRoom {
  room_id: string;
  name: string;
  created_at: string;
  has_password: boolean;
}

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [rooms, setRooms] = useState<MyRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace('/auth'); return; }
      setUser(session.user);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
      const res = await fetch(`${apiUrl}/api/rooms?userId=${session.user.id}`);
      if (res.ok) setRooms(await res.json());
      setLoading(false);
    }
    init();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    router.replace('/');
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('ja-JP', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-surface">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            {user?.user_metadata?.avatar_url && (
              <img src={user.user_metadata.avatar_url} className="w-10 h-10 rounded-full" alt="avatar" />
            )}
            <div>
              <p className="text-white font-semibold">{user?.user_metadata?.full_name ?? user?.email}</p>
              <p className="text-gray-400 text-xs">{user?.email}</p>
            </div>
          </div>
          <button onClick={signOut} className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors">
            <LogOut className="w-4 h-4" /> ログアウト
          </button>
        </div>

        {/* New meeting */}
        <Link
          href="/"
          className="flex items-center justify-between bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-5 rounded-xl transition-colors mb-8"
        >
          <div className="flex items-center gap-3">
            <Plus className="w-5 h-5" />
            <span>新しい会議を開始</span>
          </div>
          <ArrowRight className="w-4 h-4" />
        </Link>

        {/* My rooms */}
        <h2 className="text-white font-semibold mb-3">マイルーム</h2>
        {rooms.length === 0 ? (
          <div className="bg-panel border border-purple-900 rounded-2xl p-8 text-center text-gray-500 text-sm">
            作成した会議はまだありません
          </div>
        ) : (
          <div className="space-y-3">
            {rooms.map(room => (
              <div key={room.room_id} className="bg-panel border border-purple-900 rounded-xl p-4 flex items-center gap-4">
                <div className="w-9 h-9 rounded-lg bg-purple-900 flex items-center justify-center shrink-0">
                  <Video className="w-4 h-4 text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{room.name}</p>
                  <p className="text-gray-500 text-xs flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" /> {formatDate(room.created_at)}
                    {room.has_password && <span className="ml-2 text-yellow-600">🔒 パスワードあり</span>}
                  </p>
                </div>
                <Link
                  href={`/room/${room.room_id}?name=${encodeURIComponent(user?.user_metadata?.full_name ?? 'Guest')}`}
                  className="shrink-0 px-3 py-1.5 rounded-lg bg-surface border border-purple-800 text-sm text-gray-300 hover:text-white hover:border-purple-600 transition-colors"
                >
                  入室
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
