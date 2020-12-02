import type { ChildProcessWithoutNullStreams } from 'child_process';
import { createSlice, Slice, SliceCaseReducers, PayloadAction, CaseReducerActions } from '@reduxjs/toolkit';
import type { LiveInfo } from '../types';

export interface L48InitialState {
  liveList: Array<LiveInfo>;
  liveChildList: Array<string>;
}

type CaseReducers = SliceCaseReducers<L48InitialState>;

// 记录下载的child，避免immer导致无法监听close事件
export const liveChildMap: { [key: string]: ChildProcessWithoutNullStreams } = {};

const { actions, reducer }: Slice = createSlice<L48InitialState, CaseReducers>({
  name: 'l48',
  initialState: {
    liveList: [],     // 直播信息
    liveChildList: [] // 直播下载（只记录id）
  },
  reducers: {
    // 直播信息
    setLiveList(state: L48InitialState, action: PayloadAction<Array<LiveInfo>>): L48InitialState {
      state.liveList = action.payload;

      return state;
    },

    // 直播下载
    setLiveChildList(state: L48InitialState, action: PayloadAction<Array<string>>): L48InitialState {
      state.liveChildList = action.payload;

      return state;
    }
  }
});

export const { setLiveList, setLiveChildList }: CaseReducerActions<CaseReducers> = actions;
export default { l48: reducer };