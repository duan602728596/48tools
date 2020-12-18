import { createSlice, Slice, SliceCaseReducers, PayloadAction, CaseReducerActions } from '@reduxjs/toolkit';
import type { DownloadItem } from '../types';

export interface BilibiliInitialState {
  downloadList: Array<DownloadItem>;
  downloadProgress: { [key: string]: number };
}

type CaseReducers = SliceCaseReducers<BilibiliInitialState>;

const { actions, reducer }: Slice = createSlice<BilibiliInitialState, CaseReducers>({
  name: 'bilibili',
  initialState: {
    downloadList: [],    // 下载列表
    downloadProgress: {} // 下载进度
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
    }
  }
});

export const { setDownloadList, setDownloadProgress }: CaseReducerActions<CaseReducers> = actions;
export default { bilibili: reducer };