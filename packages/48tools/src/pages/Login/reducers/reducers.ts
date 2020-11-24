import { createSlice, Slice, SliceCaseReducers, PayloadAction, CaseReducerActions } from '@reduxjs/toolkit';
import QQ from '../../../function/QQ/QQ';

export interface LoginInitialState {
  loginList: Array<QQ>;
}

type CaseReducers = SliceCaseReducers<LoginInitialState>;

const { actions, reducer }: Slice = createSlice<LoginInitialState, CaseReducers>({
  name: 'login',
  initialState: {
    loginList: [] // 使用Map存储数组，保证里面的值不被immer处理
  },
  reducers: {
    // 登陆列表
    setLoginList(state: LoginInitialState, action: PayloadAction<Array<QQ>>): LoginInitialState {
      state.loginList = action.payload;

      return state;
    }
  }
});

export const { setLoginList }: CaseReducerActions<CaseReducers> = actions;
export default { login: reducer };