const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export interface RoomInfo {
  room_id: string;
  name: string;
  host_name: string;
  has_password: boolean;
  max_participants: number;
  created_at: string;
}

export interface TokenResponse {
  token: string;
  liveKitUrl: string;
  roomName: string;
}

export async function createRoom(params: {
  name: string;
  hostName: string;
  password?: string;
}): Promise<{ room_id: string; name: string }> {
  const res = await fetch(`${API_URL}/api/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? 'Failed to create room');
  }
  return res.json();
}

export async function getRoom(roomId: string): Promise<RoomInfo> {
  const res = await fetch(`${API_URL}/api/rooms/${roomId}`);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? 'Room not found');
  }
  return res.json();
}

export interface TranscriptEntry {
  id: number;
  speaker: string;
  text: string;
  elapsed_seconds: number;
  created_at: string;
}

export async function saveTranscript(params: {
  roomId: string;
  speaker: string;
  text: string;
  elapsedSeconds: number;
}): Promise<void> {
  await fetch(`${API_URL}/api/transcripts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  }).catch(() => {}); // fire-and-forget、失敗しても会議に影響させない
}

export async function getTranscripts(roomId: string): Promise<TranscriptEntry[]> {
  const res = await fetch(`${API_URL}/api/transcripts/${roomId}`);
  if (!res.ok) return [];
  return res.json();
}

export async function getToken(params: {
  roomId: string;
  participantName: string;
  password?: string;
}): Promise<TokenResponse> {
  const res = await fetch(`${API_URL}/api/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? 'Failed to get token');
  }
  return res.json();
}
