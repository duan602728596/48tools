import { setTimeout, clearTimeout } from 'node:timers';
import type { RoomIdObj } from './interface';

export type * from './interface';

/**
 * 通过url查找roomId
 * @param { string } url
 */
async function requestRoomIdCore(url: string): Promise<RoomIdObj | null> {
  try {
    const controller: AbortController = new AbortController();
    const timer: NodeJS.Timeout = setTimeout((): void => {
      controller.abort();
    }, 10_000);
    const res: Response = await fetch(url, {
      method: 'GET',
      signal: controller.signal
    });

    clearTimeout(timer);

    return res.json();
  } catch {
    return null;
  }
}

/* 查找roomId */
export async function requestRoomId(): Promise<RoomIdObj | null> {
  const url: string = 'https://fastly.jsdelivr.net/gh/duan602728596/qqtools@main/packages/NIMTest/node/roomId.json';
  const mirrorUrl: string = 'https://raw.gitmirror.com/duan602728596/qqtools/main/packages/NIMTest/node/roomId.json';

  // 使用主地址
  const res: RoomIdObj | null = await requestRoomIdCore(`${ url }?t=${ new Date().getTime() }`);

  if (res) return res;

  // 使用备用地址
  const mirrorRes: RoomIdObj | null = await requestRoomIdCore(`${ mirrorUrl }?t=${ new Date().getTime() }`);

  return mirrorRes;
}