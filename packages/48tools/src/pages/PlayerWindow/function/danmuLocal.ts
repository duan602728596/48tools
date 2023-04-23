const KEY: string = 'VIDEO_NATIVE_TRACK';

/* 读取是否开启弹幕 */
export function getDanmuLocal(): boolean {
  const danmuLocal: string | null = localStorage.getItem(KEY);

  return danmuLocal === '1';
}

/* 设置是否开启弹幕 */
export function setDanmuLocal(value: boolean): void {
  if (value) {
    localStorage.setItem(KEY, '1');
  } else {
    localStorage.removeItem(KEY);
  }
}