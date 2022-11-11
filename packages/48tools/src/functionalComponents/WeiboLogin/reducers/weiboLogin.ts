import { createSlice, type Slice, type SliceCaseReducers, type PayloadAction } from '@reduxjs/toolkit';
import type { DataDispatchFunc, CursorDispatchFunc, QueryDispatchFunc } from '@indexeddb-tools/indexeddb-redux';
import IDBRedux, { weiboLoginListObjectStoreName } from '../../../utils/IDB/IDBRedux';
import type { WeiboAccount, IDBActionFunc } from '../../../types';

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
        state.accountList = [...state.accountList];
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

export const { setAddWeiboAccountList, setAccountList, setDeleteWeiboAccount }: Record<string, Function> = actions;

// 保存微博账号
export const IDBSaveAccount: DataDispatchFunc = IDBRedux.putAction({
  objectStoreName: weiboLoginListObjectStoreName,
  successAction: setAddWeiboAccountList as IDBActionFunc
});

// 获取微博账号列表
export const IDBCursorAccountList: CursorDispatchFunc = IDBRedux.cursorAction({
  objectStoreName: weiboLoginListObjectStoreName,
  successAction: setAccountList as IDBActionFunc
});

// 删除微博登陆账号
export const IDBDeleteAccount: QueryDispatchFunc = IDBRedux.deleteAction({
  objectStoreName: weiboLoginListObjectStoreName,
  successAction: setDeleteWeiboAccount as IDBActionFunc
});

export default { weiboLogin: reducer };