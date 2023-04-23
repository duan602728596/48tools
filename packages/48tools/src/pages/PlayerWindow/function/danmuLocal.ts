const KEY: string = 'VIDEO_NATIVE_TRACK';
const DISABLED_VALUE: string = 'false';

/* 读取是否开启弹幕 */
export function getDanmuLocal(): boolean {
  const danmuLocal: string | null = localStorage.getItem(KEY);

  return !(danmuLocal === DISABLED_VALUE);
}

/* 设置是否开启弹幕 */
export function setDanmuLocal(value: boolean): void {
  if (value) {
    localStorage.removeItem(KEY);
  } else {
    localStorage.setItem(KEY, DISABLED_VALUE);
  }
}