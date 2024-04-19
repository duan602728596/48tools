import { createStructuredSelector, type Selector } from 'reselect';
import type { WeiboLoginInitialState } from './weiboLogin';
import type { WeiboAccount } from '../../../commonTypes';

/* redux selector */
export type WeiboLoginRState = { weiboLogin: WeiboLoginInitialState };

export const weiboLoginSelector: Selector<WeiboLoginRState, WeiboLoginInitialState> = createStructuredSelector({
  // 微博已登陆账号
  accountList: ({ weiboLogin }: WeiboLoginRState): Array<WeiboAccount> => weiboLogin.accountList
});