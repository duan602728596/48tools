import {
  createSlice,
  createEntityAdapter,
  type Slice,
  type PayloadAction,
  type CaseReducer,
  type CaseReducerActions,
  type EntityAdapter,
  type EntityState,
  type EntitySelectors,
  type Update
} from '@reduxjs/toolkit';
import type { LiveItem } from '../types';

type WeiboLiveEntityState = EntityState<LiveItem, string>;

export const weiboLiveAdapter: EntityAdapter<LiveItem, string> = createEntityAdapter({
  selectId: (item: LiveItem): string => item.qid
});
export const weiboLiveSelectors: EntitySelectors<LiveItem, WeiboLiveEntityState, string>
  = weiboLiveAdapter.getSelectors();

export type WeiboLiveInitialState = WeiboLiveEntityState;

type SliceReducers = {
  setLiveOne: CaseReducer<WeiboLiveInitialState, PayloadAction<LiveItem>>;
  setRemoveLiveOne: CaseReducer<WeiboLiveInitialState, PayloadAction<string>>;
};

type SliceSelectors = {
  liveList: (state: WeiboLiveInitialState) => Array<LiveItem>;
};

const sliceName: 'weiboLive' = 'weiboLive';
const { actions, selectors: selectorsObject, reducer }: Slice<
  WeiboLiveInitialState,
  SliceReducers,
  typeof sliceName,
  typeof sliceName,
  SliceSelectors
> = createSlice({
  name: sliceName,
  initialState: weiboLiveAdapter.getInitialState(),
  reducers: {
    setLiveOne: weiboLiveAdapter.setOne,
    setRemoveLiveOne: weiboLiveAdapter.removeOne
  },
  selectors: {
    liveList: (state: WeiboLiveInitialState): Array<LiveItem> => weiboLiveSelectors.selectAll(state)
  }
});

export const {
  setLiveOne,
  setRemoveLiveOne
}: CaseReducerActions<SliceReducers, typeof sliceName> = actions;
export { selectorsObject };
export default { [sliceName]: reducer };