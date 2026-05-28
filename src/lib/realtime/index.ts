export interface RealtimeEvent {
  channel: string;
  event: string;
  data: unknown;
}

let pusherClient: unknown = null;

export function getRealtimeClient() {
  if (pusherClient) return pusherClient;

  const appKey = process.env.SOKETI_APP_KEY;
  const host = process.env.SOKETI_HOST;
  if (!appKey || !host) return null;

  // TODO: Initialize Pusher-compatible client (Soketi)
  return null;
}

export function broadcastEvent(_event: RealtimeEvent): void {
  const client = getRealtimeClient();
  if (!client) {
    console.warn("Realtime not configured. Set SOKETI_APP_KEY and SOKETI_HOST.");
    return;
  }
  // TODO: Implement broadcasting via Soketi/Pusher
}
