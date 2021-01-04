import { createSlice, Slice, SliceCaseReducers, PayloadAction, CaseReducerActions, ActionCreator } from '@reduxjs/toolkit';
import { findIndex } from 'lodash';
import type { ConcatItem } from '../types';

export interface ConcatInitialState {
  concatList: Array<ConcatItem>;
}

type CaseReducers = SliceCaseReducers<ConcatInitialState>;

const { actions, reducer }: Slice = createSlice<ConcatInitialState, CaseReducers>({
  name: 'concat',
  initialState: {
    concatList: []
  },
  reducers: {
    // 添加视频合并队列
    setConcatListAdd(state: ConcatInitialState, action: PayloadAction<Array<ConcatItem>>): ConcatInitialState {
      state.concatList = state.concatList.concat(action.payload);

      return state;
    }
  }
});

export const { setConcatListAdd }: CaseReducerActions<CaseReducers> = actions;
export default { concat: reducer };