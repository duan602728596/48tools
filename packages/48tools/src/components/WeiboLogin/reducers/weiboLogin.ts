import { createSlice, Slice, SliceCaseReducers, PayloadAction, CaseReducerActions, ActionCreator } from '@reduxjs/toolkit';
import dbRedux, { weiboLoginListObjectStoreName } from '../../../utils/idb/dbRedux';
import type { WeiboAccount } from '../../../types';

export interface WeiboLoginInitialState {
  accountList: Array<WeiboAccount>;
}

type CaseReducers = SliceCaseReducers<WeiboLoginInitialState>;

const { actions, reducer }: Slice = createSlice<WeiboLoginInitialState, CaseReducers>({
  name: 'weiboLogin',
  initialState: {
    accountList: [] // 微博已登陆账号
  },
  reducers: {
    // 添加一个账号
    setAddWeiboAccountList(state: WeiboLoginInitialState, action: PayloadAction<{ data: WeiboAccount }>): void {
      const index: number = state.accountList.findIndex((o: WeiboAccount): boolean => o.id === action.payload.data.id);

      if (index >= 0) {
        state.accountList[index] = action.payload.data;
        state.accountList = [... state.accountList];
      } else {
        state.accountList = state.accountList.concat([action.payload.data]);
      }
    },

    // 账号列表
    setAccountList(state: WeiboLoginInitialState, action: PayloadAction<{ result: Array<WeiboAccount> }>): void {
      state.accountList = action.payload.result;
    },

    // 删除账号
    setDeleteWeiboAccount(state: WeiboLoginInitialState, action: PayloadAction<{ query: string }>): void {
      const index: number = state.accountList.findIndex((o: WeiboAccount): boolean => o.id === action.payload.query);

      if (index >= 0) {
        const newAccountList: Array<WeiboAccount> = [...state.accountList];

        newAccountList.splice(index, 1);
        state.accountList = newAccountList;
      }
    }
  }
});

export const { setAddWeiboAccountList, setAccountList, setDeleteWeiboAccount }: CaseReducerActions<CaseReducers> = actions;

// 保存微博账号
export const idbSaveAccount: ActionCreator<any> = dbRedux.putAction({
  objectStoreName: weiboLoginListObjectStoreName,
  successAction: setAddWeiboAccountList
});

// 获取微博账号列表
export const idbCursorAccountList: ActionCreator<any> = dbRedux.cursorAction({
  objectStoreName: weiboLoginListObjectStoreName,
  successAction: setAccountList
});

// 删除微博登陆账号
export const idbDeleteAccount: ActionCreator<any> = dbRedux.deleteAction({
  objectStoreName: weiboLoginListObjectStoreName,
  successAction: setDeleteWeiboAccount
});

export default { weiboLogin: reducer };