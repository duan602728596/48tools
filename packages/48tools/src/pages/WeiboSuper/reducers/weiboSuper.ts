import { createSlice, Slice, SliceCaseReducers, PayloadAction, CaseReducerActions } from '@reduxjs/toolkit';
import type { WeiboCheckinResult } from '../types';

export interface WeiboSuperInitialState {
  weiboCheckinList: Array<WeiboCheckinResult>;
  checkIn: boolean;
}

type CaseReducers = SliceCaseReducers<WeiboSuperInitialState>;

const { actions, reducer }: Slice = createSlice<WeiboSuperInitialState, CaseReducers>({
  name: 'weiboSuper',
  initialState: {
    weiboCheckinList: [], // 超话签到结果
    checkIn: false        // 是否在签到中，用来打断签到的
  },
  reducers: {
    // 设置签到状态
    setCheckIn(state: WeiboSuperInitialState, action: PayloadAction<boolean>): WeiboSuperInitialState {
      state.checkIn = action.payload;

      if (action.payload) {
        state.weiboCheckinList = []; // 开始签到时，需要清空列表
      }

      return state;
    },

    // 追加新的超话列表
    setCheckinList(state: WeiboSuperInitialState, action: PayloadAction<WeiboCheckinResult>): WeiboSuperInitialState {
      state.weiboCheckinList = state.weiboCheckinList.concat([action.payload]);

      return state;
    }
  }
});

export const { setCheckIn, setCheckinList }: CaseReducerActions<CaseReducers> = actions;
export default { weiboSuper: reducer };