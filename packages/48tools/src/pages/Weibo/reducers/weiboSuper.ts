import { createSlice, type Slice, type PayloadAction, type CaseReducer, type CaseReducerActions } from '@reduxjs/toolkit';
import type { WeiboCheckinResult, Quantity } from '../types';

export interface WeiboSuperInitialState {
  weiboCheckinList: Array<WeiboCheckinResult>;
  checkIn: boolean;
  quantity: Quantity;
}

type SliceReducers = {
  setCheckIn: CaseReducer<WeiboSuperInitialState, PayloadAction<boolean>>;
  updateCheckInList: CaseReducer<WeiboSuperInitialState, PayloadAction<ReqTopicCheckinReturn>>;
};

// 微博签到
interface ReqTopicCheckinReturn {
  result: WeiboCheckinResult;
  quantity: Quantity;
}

export const defaultQuantityValue: Quantity = {
  checkedInLen: 0,
  total: 0
};

const sliceName: 'weiboSuper' = 'weiboSuper';
const { actions, reducer }: Slice<WeiboSuperInitialState, SliceReducers, typeof sliceName> = createSlice({
  name: 'weiboSuper',
  initialState: {
    weiboCheckinList: [], // 超话签到结果
    checkIn: false,       // 是否在签到中，用来打断签到的
    quantity: defaultQuantityValue
  },
  reducers: {
    // 设置签到状态
    setCheckIn(state: WeiboSuperInitialState, action: PayloadAction<boolean>): void {
      state.checkIn = action.payload;

      if (action.payload) {
        state.weiboCheckinList = []; // 开始签到时，需要清空列表
        state.quantity = {
          checkedInLen: 0,
          total: 0
        };
      }
    },

    // 更新签到状态
    updateCheckInList(state: WeiboSuperInitialState, action: PayloadAction<ReqTopicCheckinReturn>): void {
      state.weiboCheckinList = state.weiboCheckinList.concat([action.payload.result]); // 追加新的超话
      state.quantity = action.payload.quantity; // 已签到状态
    }
  }
});

export const { setCheckIn, updateCheckInList }: CaseReducerActions<SliceReducers, typeof sliceName> = actions;
export default { [sliceName]: reducer };