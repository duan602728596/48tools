import {
  createSlice,
  createEntityAdapter,
  type Slice,
  type SliceCaseReducers,
  type EntityAdapter,
  type EntityState,
  type EntitySelectors
} from '@reduxjs/toolkit';
import type { ProcessItem } from '../types';

// 下载列表
export const ffmpegProcessListAdapter: EntityAdapter<ProcessItem> = createEntityAdapter({
  selectId: (item: ProcessItem): string => item.id
});
export const ffmpegProcessListSelectors: EntitySelectors<ProcessItem, EntityState<ProcessItem>>
  = ffmpegProcessListAdapter.getSelectors();

export type FFmpegProcessInitialState = EntityState<ProcessItem>;

type CaseReducers = SliceCaseReducers<FFmpegProcessInitialState>;

const { actions, reducer }: Slice = createSlice<FFmpegProcessInitialState, CaseReducers, 'FFmpegProcess'>({
  name: 'FFmpegProcess',
  initialState: ffmpegProcessListAdapter.getInitialState(),
  reducers: {
    setAddProcess: ffmpegProcessListAdapter.addOne,
    setDeleteProcess: ffmpegProcessListAdapter.removeOne,
    setUpdateProcess: ffmpegProcessListAdapter.updateOne
  }
});

export const {
  setAddProcess,
  setDeleteProcess,
  setUpdateProcess
}: Record<string, Function> = actions;
export default { FFmpegProcess: reducer };