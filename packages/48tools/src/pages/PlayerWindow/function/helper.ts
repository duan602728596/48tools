import * as process from 'node:process';
import { Pocket48Login } from '../../../functionalComponents/Pocket48Login/enum';
import type { UserInfo, UserInfoString } from '../../../functionalComponents/Pocket48Login/types';

export const isWindowsArm: boolean = process.platform === 'win32' && process.arch === 'arm64';

// 获取用户信息
export function getUserInfo(): UserInfo | null {
  const userInfoStr: string | null = localStorage.getItem(Pocket48Login.StorageKey);

  return userInfoStr !== null ? JSON.parse(userInfoStr as UserInfoString) : null;
}