import { shell } from 'electron';
import type { MouseEvent } from 'react';

/* 打开微博 */
export function handleOpenWeiboClick(id: string, event: MouseEvent): void {
  shell.openExternal(`https://weibo.com/u/${ id }`);
}