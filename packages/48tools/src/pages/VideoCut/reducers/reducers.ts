import { createSlice, Slice, SliceCaseReducers, PayloadAction, CaseReducerActions } from '@reduxjs/toolkit';
import type { CutItem } from '../types';

export interface VideoCutInitialState {
  cutList: Array<CutItem>;
}

type CaseReducers = SliceCaseReducers<VideoCutInitialState>;

const { actions, reducer }: Slice = createSlice<VideoCutInitialState, CaseReducers>({
  name: 'videoCut',
  initialState: {
    cutList: [] // 视频裁剪队列
  },
  reducers: {}
});

export const {}: CaseReducerActions<CaseReducers> = actions;
export default { videoCut: reducer };