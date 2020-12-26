import { createSlice, Slice, SliceCaseReducers, PayloadAction, CaseReducerActions } from '@reduxjs/toolkit';
import { findIndex } from 'lodash';
import type { InLiveWebWorkerItem } from '../types';

export interface Live48InitialState {
  inLiveList: Array<InLiveWebWorkerItem>;
}

type CaseReducers = SliceCaseReducers<Live48InitialState>;

const { actions, reducer }: Slice = createSlice<Live48InitialState, CaseReducers>({
  name: 'live48',
  initialState: {
    inLiveList: [] // 当前抓取的直播列表
  },
  reducers: {
    // 添加当前抓取的直播列表
    setAddInLiveList(state: Live48InitialState, action: PayloadAction<InLiveWebWorkerItem>): Live48InitialState {
      state.inLiveList = state.inLiveList.concat([action.payload]);

      return state;
    },

    // 删除当前抓取的直播列表
    setDeleteInLiveList(state: Live48InitialState, action: PayloadAction<string>): Live48InitialState {
      const index: number = findIndex(state.inLiveList, { id: action.payload });

      if (index >= 0) {
        state.inLiveList.splice(index, 1);
        state.inLiveList = [...state.inLiveList];
      }

      return state;
    }
  }
});

export const { setAddInLiveList, setDeleteInLiveList }: CaseReducerActions<CaseReducers> = actions;
export default { live48: reducer };