import { createSlice, Slice, SliceCaseReducers, PayloadAction, CaseReducerActions, ActionCreator } from '@reduxjs/toolkit';
import dbRedux, { bilibiliLiveObjectStoreName } from '../../../utils/idb/dbRedux';
import type { DownloadItem, LiveItem } from '../types';

export interface BilibiliInitialState {
  downloadList: Array<DownloadItem>;
  downloadProgress: { [key: string]: number };
  bilibiliLiveList: Array<LiveItem>;
}

type CaseReducers = SliceCaseReducers<BilibiliInitialState>;

const { actions, reducer }: Slice = createSlice<BilibiliInitialState, CaseReducers>({
  name: 'bilibili',
  initialState: {
    downloadList: [],     // 下载列表
    downloadProgress: {}, // 下载进度
    bilibiliLiveList: []  // 数据库内获取的直播间列表
  },
  reducers: {
    // 设置下载列表
    setDownloadList(state: BilibiliInitialState, action: PayloadAction<Array<DownloadItem>>): BilibiliInitialState {
      state.downloadList = action.payload;

      return state;
    },

    // 设置下载进度
    setDownloadProgress(state: BilibiliInitialState, action: PayloadAction<{ [key: string]: number }>): BilibiliInitialState {
      state.downloadProgress = action.payload;

      return state;
    },

    // 直播间列表
    setBilibiliLiveList(state: BilibiliInitialState, action: PayloadAction<{ data: LiveItem }>): BilibiliInitialState {
      state.bilibiliLiveList = state.bilibiliLiveList.concat([action.payload.data]);

      return state;
    }
  }
});

export const {
  setDownloadList,
  setDownloadProgress,
  setBilibiliLiveList
}: CaseReducerActions<CaseReducers> = actions;

// 保存数据
export const saveFormData: ActionCreator<any> = dbRedux.putAction({
  objectStoreName: bilibiliLiveObjectStoreName,
  successAction: setBilibiliLiveList
});

export default { bilibili: reducer };