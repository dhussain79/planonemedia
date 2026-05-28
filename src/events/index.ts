export type EventType =
  | "user.signup"
  | "user.login"
  | "supplier.claim.submitted"
  | "supplier.claim.approved"
  | "supplier.claim.rejected"
  | "media.created"
  | "media.updated"
  | "booking.created"
  | "booking.confirmed"
  | "booking.completed"
  | "email.sent"
  | "email.opened"
  | "email.clicked";

export interface DomainEvent {
  type: EventType;
  payload: Record<string, unknown>;
  timestamp: Date;
  userId?: string;
}

const listeners: Map<EventType, Array<(event: DomainEvent) => void>> = new Map();

export function onEvent(type: EventType, handler: (event: DomainEvent) => void) {
  const handlers = listeners.get(type) ?? [];
  handlers.push(handler);
  listeners.set(type, handlers);
}

export function emitEvent(type: EventType, payload: Record<string, unknown>, userId?: string) {
  const event: DomainEvent = { type, payload, timestamp: new Date(), userId };
  const handlers = listeners.get(type) ?? [];
  for (const handler of handlers) {
    try { handler(event); } catch (e) { console.error(`Event handler error [${type}]:`, e); }
  }
}
