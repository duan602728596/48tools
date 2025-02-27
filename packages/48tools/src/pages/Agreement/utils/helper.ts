const NOW_POWER_VERSION_KEY: 'POWER_VERSION_KEY' = 'POWER_VERSION_KEY';
const NOW_POWER_VERSION: '20230820' = '20230820';

/* 判断是否需要阅读声明 */
export function needToReadPower(): boolean {
  if (globalThis.__INITIAL_STATE__.isTest) return false;

  const userTourVersion: string | null = localStorage.getItem(NOW_POWER_VERSION_KEY);

  return NOW_POWER_VERSION !== userTourVersion;
}

/* 设置已阅读声明 */
export function setReadPower(): void {
  localStorage.setItem(NOW_POWER_VERSION_KEY, NOW_POWER_VERSION);
}