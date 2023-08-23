import { setTimeout, clearTimeout } from 'node:timers';
import type { RoomIdObj } from './interface';

export type * from './interface';

/* 查找roomid */
export async function requestRoomId(): Promise<RoomIdObj> {
  const controller: AbortController = new AbortController();
  const timer: NodeJS.Timeout = setTimeout((): void => {
    controller.abort();
  }, 10_000);
  const res: Response = await fetch(
    'https://fastly.jsdelivr.net/gh/duan602728596/qqtools@main/packages/NIMTest/node/roomId.json'
    + `?t=${ new Date().getTime() }`, {
      method: 'GET',
      signal: controller.signal
    });

  clearTimeout(timer);

  return res.json();
}