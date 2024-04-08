import {
  createSlice,
  createEntityAdapter,
  type Slice,
  type CaseReducerActions,
  type EntityAdapter,
  type EntityState,
  type EntitySelectors
} from '@reduxjs/toolkit';
import type { LiveItem } from '../types';

type WeiboLiveEntityState = EntityState<LiveItem, string>;

export const weiboLiveAdapter: EntityAdapter<LiveItem, string> = createEntityAdapter({
  selectId: (item: LiveItem): string => item.qid
});
export const weiboLiveSelectors: EntitySelectors<LiveItem, WeiboLiveEntityState, string>
  = weiboLiveAdapter.getSelectors();

export type WeiboLiveInitialState = WeiboLiveEntityState;

type SliceReducers = {};

const sliceName: 'weiboLive' = 'weiboLive';
const { actions, reducer }: Slice<WeiboLiveInitialState, SliceReducers, typeof sliceName> = createSlice({
  name: sliceName,
  initialState: weiboLiveAdapter.getInitialState(),
  reducers: {
    setAddLiveOne: weiboLiveAdapter.addOne,
    setUpdateOne: weiboLiveAdapter.updateOne,
    setRemoveLiveOne: weiboLiveAdapter.removeOne
  }
});

export const {

}: CaseReducerActions<SliceReducers, typeof sliceName> = actions;
export default { [sliceName]: reducer };