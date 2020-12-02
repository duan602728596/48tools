import type { ChildProcessWithoutNullStreams } from 'child_process';
import { createSlice, Slice, SliceCaseReducers, PayloadAction, CaseReducerActions } from '@reduxjs/toolkit';
import type { LiveInfo } from '../types';

export interface LiveChildItem {
  id: string;
  child: ChildProcessWithoutNullStreams;
}

export interface L48InitialState {
  liveList: Array<LiveInfo>;
  liveChildList: Array<LiveChildItem>;
}

type CaseReducers = SliceCaseReducers<L48InitialState>;

const { actions, reducer }: Slice = createSlice<L48InitialState, CaseReducers>({
  name: 'l48',
  initialState: {
    liveList: [],     // 直播信息
    liveChildList: [] // 直播下载
  },
  reducers: {
    // 直播信息
    setLiveList(state: L48InitialState, action: PayloadAction<Array<LiveInfo>>): L48InitialState {
      state.liveList = action.payload;

      return state;
    },

    // 直播下载
    setLiveChildList(state: L48InitialState, action: PayloadAction<Array<LiveChildItem>>): L48InitialState {
      console.log(action.payload);

      state.liveChildList = action.payload;

      return state;
    }
  }
});

export const { setLiveList, setLiveChildList }: CaseReducerActions<CaseReducers> = actions;
export default { l48: reducer };