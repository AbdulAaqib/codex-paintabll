import { DT, MATCH_MS } from '../../../packages/shared/src/constants.ts';
import { movePlayer } from '../../../packages/shared/src/movement.ts';
import type { Shot } from '../../../packages/shared/src/types.ts';
import { shoot } from './combat.ts';
import { respawn } from './players.ts';
import { idleInput, type Room } from './rooms.ts';
export function simulate(room: Room, now: number): Shot[] {
  const shots: Shot[] = [];
  const players = [...room.members.values()].filter((m) => m.socketId).map((m) => m.player);
  for (const [id, m] of room.members) {
    if (!m.socketId) {
      if (now - m.disconnectedAt > 30000) room.members.delete(id);
      continue;
    }
    const p = m.player;
    if (p.hp <= 0) {
      if (now >= p.respawnAt) {
        respawn(p, players, now);
        m.input = idleInput();
      }
      continue;
    }
    const input =
      now - m.lastInputAt < 250
        ? m.input
        : { ...m.input, x: 0, z: 0, fire: false, jump: false, dive: false, stumble: false };
    movePlayer(p, input, DT, now);
    if (input.fire) {
      const shot = shoot(p, players, now, m.lastShot);
      if (shot) {
        m.lastShot = now;
        shots.push(shot);
        if (shot.killed) {
          const victim = players.find((q) => q.id === shot.hit)!;
          room.feed.unshift({
            id: shot.id,
            killer: p.name,
            victim: victim.name,
            color: p.color,
            at: now,
          });
          room.feed = room.feed.slice(0, 5);
        }
      }
    }
    m.input = { ...m.input, jump: false, dive: false, stumble: false };
  }
  return shots;
}
