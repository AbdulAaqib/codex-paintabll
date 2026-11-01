import type { Input, Shot, Snapshot } from './types.ts';
export type JoinRequest = { name: string; room?: string; token?: string; avatarId?: string };
export type JoinReply =
  | { ok: true; id: string; token: string; snapshot: Snapshot }
  | { ok: false; error: string };
export interface ClientEvents {
  join: (data: JoinRequest, reply: (result: JoinReply) => void) => void;
  input: (input: Input) => void;
}
export interface ServerEvents {
  snapshot: (snapshot: Snapshot) => void;
  shot: (shot: Shot) => void;
  notice: (text: string) => void;
}
