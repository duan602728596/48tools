import { createSlice, Slice, SliceCaseReducers, PayloadAction, CaseReducerActions } from '@reduxjs/toolkit';
import type { DownloadItem } from '../types';
import type { MessageEventData } from '../Download/downloadBilibiliVideo.worker';

export interface BilibiliDownloadInitialState {
  downloadList: Array<DownloadItem>;
  downloadProgress: { [key: string]: number };
}

type CaseReducers = SliceCaseReducers<BilibiliDownloadInitialState>;

const { actions, reducer }: Slice = createSlice<BilibiliDownloadInitialState, CaseReducers>({
  name: 'bilibiliDownload',
  initialState: {
    downloadList: [],    // 下载列表
    downloadProgress: {} // 下载进度
  },
  reducers: {
    // 设置下载列表
    setDownloadList(state: BilibiliDownloadInitialState, action: PayloadAction<Array<DownloadItem>>): BilibiliDownloadInitialState {
      state.downloadList = action.payload;

      return state;
    },

    // 设置下载进度
    setDownloadProgress(state: BilibiliDownloadInitialState, action: PayloadAction<MessageEventData>): BilibiliDownloadInitialState {
      const { type, qid, data }: MessageEventData = action.payload;

      if (type === 'progress') {
        state.downloadProgress[qid] = data;
      } else if (type === 'success') {
        delete state.downloadProgress[qid]; // 下载完成
      }

      state.downloadProgress = { ...state.downloadProgress };

      return state;
    }
  }
});

export const { setDownloadList, setDownloadProgress }: CaseReducerActions<CaseReducers> = actions;
export default { bilibiliDownload: reducer };