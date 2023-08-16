import { redirect } from 'react-router-dom';

const NOW_POWER_VERSION_KEY: 'POWER_VERSION_KEY' = 'POWER_VERSION_KEY';
const NOW_POWER_VERSION: '20230816' = '20230816';

/* 判断是否需要阅读声明 */
export function needToReadPower(): boolean {
  const userTourVersion: string | null = localStorage.getItem(NOW_POWER_VERSION_KEY);

  return NOW_POWER_VERSION !== userTourVersion;
}

export function needToReadPowerLoader(): Response | null {
  if (needToReadPower()) {
    return redirect('/agreement/power?read=1');
  }

  return null;
}

/* 设置已阅读声明 */
export function setReadPower(): void {
  localStorage.setItem(NOW_POWER_VERSION_KEY, NOW_POWER_VERSION);
}