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
    setAddWeiboAccountList(state: WeiboLoginInitialState, action: PayloadAction<{ data: WeiboAccount }>): WeiboLoginInitialState {
      state.accountList = state.accountList.concat([action.payload.data]);

      return state;
    },

    // 账号列表
    setAccountList(state: WeiboLoginInitialState, action: PayloadAction<{ result: Array<WeiboAccount> }>): WeiboLoginInitialState {
      state.accountList = action.payload.result;

      return state;
    }
  }
});

export const { setAddWeiboAccountList, setAccountList }: CaseReducerActions<CaseReducers> = actions;

// 保存数据
export const idbSaveAccount: ActionCreator<any> = dbRedux.putAction({
  objectStoreName: weiboLoginListObjectStoreName,
  successAction: setAddWeiboAccountList
});

// 获取数据列表
export const idbCursorAccountList: ActionCreator<any> = dbRedux.cursorAction({
  objectStoreName: weiboLoginListObjectStoreName,
  successAction: setAccountList
});

export default { weiboLogin: reducer };