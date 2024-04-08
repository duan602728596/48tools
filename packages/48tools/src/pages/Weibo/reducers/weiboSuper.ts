import {
  createSlice,
  createAsyncThunk,
  type Slice,
  type PayloadAction,
  type CaseReducer,
  type CaseReducerActions,
  type AsyncThunk,
  type ActionReducerMapBuilder
} from '@reduxjs/toolkit';
import { requestTopicCheckin, type CheckinResult } from '@48tools-api/weibo/super';
import type { WeiboCheckinResult, Quantity } from '../WeiboSuper/types';

export interface WeiboSuperInitialState {
  weiboCheckinList: Array<WeiboCheckinResult>;
  checkIn: boolean;
  quantity: Quantity;
}

type SliceReducers = {
  setCheckIn: CaseReducer<WeiboSuperInitialState, PayloadAction<boolean>>;
};

// 微博签到
interface ReqTopicCheckinReturn {
  result: WeiboCheckinResult;
  quantity: Quantity;
}

interface ReqTopicCheckinPayload extends ReqTopicCheckinReturn {
  cookie: string;
  superId: string;
}

export const reqTopicCheckin: AsyncThunk<ReqTopicCheckinReturn, ReqTopicCheckinPayload, {}> = createAsyncThunk(
  'weiboSuper/微博签到',
  async function(payload: ReqTopicCheckinPayload, thunkAPI: any): Promise<ReqTopicCheckinReturn> {
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
    }
  },
  extraReducers(builder: ActionReducerMapBuilder<WeiboSuperInitialState>): void {
    builder.addCase(
      reqTopicCheckin.fulfilled,
      function(state: WeiboSuperInitialState, action: PayloadAction<ReqTopicCheckinReturn>): void {
        state.weiboCheckinList = state.weiboCheckinList.concat([action.payload.result]); // 追加新的超话
        state.quantity = action.payload.quantity; // 已签到状态
      });
  }
});

export const { setCheckIn }: CaseReducerActions<SliceReducers, typeof sliceName> = actions;
export default { [sliceName]: reducer };