import { createSlice, Slice, SliceCaseReducers, PayloadAction, CaseReducerActions } from '@reduxjs/toolkit';
import type { LiveInfo } from '../types';

export interface L48InitialState {
  liveList: Array<LiveInfo>;
}

type CaseReducers = SliceCaseReducers<L48InitialState>;

const { actions, reducer }: Slice = createSlice<L48InitialState, CaseReducers>({
  name: 'l48',
  initialState: {
    liveList: [] // 直播信息
  },
  reducers: {
    // 直播信息
    setLiveList(state: L48InitialState, action: PayloadAction<Array<LiveInfo>>): L48InitialState {
      state.liveList = action.payload;

      return state;
    }
  }
});

export const { setLiveList }: CaseReducerActions<CaseReducers> = actions;
export default { l48: reducer };