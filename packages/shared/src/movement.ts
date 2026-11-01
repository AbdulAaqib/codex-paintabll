import { ARENA, HEIGHT, RADIUS, SPEED, MAP_BOUNDS } from './constants.ts';
import type { Input, Player } from './types.ts';
export function floorAt(x: number, z: number, y: number) {
  let floor = 0;
  for (const b of ARENA) {
    const [bx, by, bz] = b.position,
      [sx, sy, sz] = b.size;
    if (Math.abs(x - bx) < sx / 2 + RADIUS * 0.6 && Math.abs(z - bz) < sz / 2 + RADIUS * 0.6) {
      const top =
        b.kind === 'ramp' ? Math.max(0, Math.min(sy, ((bz + sz / 2 - z) / sz) * sy)) : by + sy / 2;
      if (top <= y + 0.24) floor = Math.max(floor, top);
    }
  }
  return floor;
}
export function movePlayer(p: Player, input: Input, dt: number, now: number) {
  if (p.hp <= 0) return;
  p.yaw = input.yaw;
  p.pitch = input.pitch;
  p.seq = input.seq;
  if (input.stumble && p.grounded && now > p.knockUntil + 1200) p.knockUntil = now + 900;
  if (input.dive && p.grounded && now > p.diveUntil + 1100) p.diveUntil = now + 500;
  const knock = now < p.knockUntil,
    dive = now < p.diveUntil;
  const len = Math.max(1, Math.hypot(input.x, input.z));
  let vx = ((input.x * Math.cos(input.yaw) + input.z * Math.sin(input.yaw)) / len) * SPEED;
  let vz = ((-input.x * Math.sin(input.yaw) + input.z * Math.cos(input.yaw)) / len) * SPEED;
  if (knock) {
    vx *= 0.12;
    vz *= 0.12;
  }
  if (dive) {
    vx = -Math.sin(input.yaw) * 11;
    vz = -Math.cos(input.yaw) * 11;
  }
  p.moving = Math.hypot(vx, vz) > 0.2;
  if (input.jump && p.grounded && !knock) {
    p.vy = 7;
    p.grounded = false;
  }
  p.vy -= 19 * dt;
  const oldY = p.position.y;
  p.position.y += p.vy * dt;
  for (const axis of ['x', 'z'] as const) {
    p.position[axis] += (axis === 'x' ? vx : vz) * dt;
    for (const b of ARENA) {
      if (b.kind === 'ramp') continue;
      const [bx, by, bz] = b.position,
        [sx, sy, sz] = b.size;
      if (oldY >= by + sy / 2 - 0.12 || p.position.y + HEIGHT < by - sy / 2) continue;
      if (
        Math.abs(p.position.x - bx) < sx / 2 + RADIUS &&
        Math.abs(p.position.z - bz) < sz / 2 + RADIUS
      ) {
        const c = axis === 'x' ? bx : bz,
          half = (axis === 'x' ? sx : sz) / 2 + RADIUS;
        p.position[axis] = c + (p.position[axis] < c ? -half : half);
      }
    }
  }
  p.position.x = Math.max(MAP_BOUNDS.minX + 0.6, Math.min(MAP_BOUNDS.maxX - 0.6, p.position.x));
  p.position.z = Math.max(MAP_BOUNDS.minZ + 0.6, Math.min(MAP_BOUNDS.maxZ - 0.6, p.position.z));
  const floor = floorAt(p.position.x, p.position.z, Math.max(oldY, p.position.y));
  if (p.position.y <= floor && p.vy <= 0) {
    p.position.y = floor;
    p.vy = 0;
    p.grounded = true;
  } else p.grounded = false;
}
