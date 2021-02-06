import {
  createSlice,
  createAsyncThunk,
  Slice,
  SliceCaseReducers,
  PayloadAction,
  CaseReducerActions,
  AsyncThunk
} from '@reduxjs/toolkit';
import { requestTopicCheckin } from '../services/weiboSuper';
import type { WeiboCheckinResult, Quantity } from '../types';
import type { CheckinResult } from '../services/interface';

export interface WeiboSuperInitialState {
  weiboCheckinList: Array<WeiboCheckinResult>;
  checkIn: boolean;
  quantity: Quantity;
}

type CaseReducers = SliceCaseReducers<WeiboSuperInitialState>;

// 签到
export interface reqTopicCheckinReturn {
  result: WeiboCheckinResult;
  quantity: Quantity;
}

export interface reqTopicCheckinPayload extends reqTopicCheckinReturn {
  cookie: string;
  superId: string;
}

export const reqTopicCheckin: AsyncThunk<reqTopicCheckinReturn, reqTopicCheckinPayload, any> = createAsyncThunk(
  'weiboSuper/微博签到',
  async function(payload: reqTopicCheckinPayload, thunkAPI: any): Promise<reqTopicCheckinReturn> {
    const res: CheckinResult = await requestTopicCheckin(payload.cookie, payload.superId);

    Object.assign(payload.result, {
      code: Number(res.code),
      result: Number(res.code) === 100000
        ? `${ res.data.alert_title } ${ res.data.alert_subtitle }`
        : (res.msg && res.msg !== '' ? res.msg : '签到失败')
    });

    return {
      result: payload.result,
      quantity: { ...payload.quantity }
    };
  });

const { actions, reducer }: Slice = createSlice<WeiboSuperInitialState, CaseReducers>({
  name: 'weiboSuper',
  initialState: {
    weiboCheckinList: [], // 超话签到结果
    checkIn: false,       // 是否在签到中，用来打断签到的
    quantity: {
      checkedInLen: 0,    // 已签到数
      total: 0            // 签到总数
    }
  },
  reducers: {
    // 设置签到状态
    setCheckIn(state: WeiboSuperInitialState, action: PayloadAction<boolean>): WeiboSuperInitialState {
      state.checkIn = action.payload;

      if (action.payload) {
        state.weiboCheckinList = []; // 开始签到时，需要清空列表
        state.quantity = {
          checkedInLen: 0,
          total: 0
        };
      }

      return state;
    }
  },
  extraReducers: {
    [reqTopicCheckin.fulfilled as any](state: WeiboSuperInitialState, action: PayloadAction<reqTopicCheckinReturn>): void {
      state.weiboCheckinList = state.weiboCheckinList.concat([action.payload.result]); // 追加新的超话
      state.quantity = action.payload.quantity; // 已签到状态
    }
  }
});

export const { setCheckIn }: CaseReducerActions<CaseReducers> = actions;
export default { weiboSuper: reducer };