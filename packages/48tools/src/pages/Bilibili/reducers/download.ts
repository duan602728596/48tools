import { createSlice, Slice, SliceCaseReducers, PayloadAction, CaseReducerActions } from '@reduxjs/toolkit';
import { findIndex } from 'lodash-es';
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
    // 添加下载
    setAddDownloadList(state: BilibiliDownloadInitialState, action: PayloadAction<DownloadItem>): void {
      state.downloadList = state.downloadList.concat([action.payload]);
    },

    // 删除下载
    setDeleteDownloadList(state: BilibiliDownloadInitialState, action: PayloadAction<DownloadItem>): void {
      const index: number = findIndex(state.downloadList, { qid: action.payload.qid });

      if (index >= 0) {
        state.downloadList.splice(index, 1);
        state.downloadList = [...state.downloadList];
      }
    },

    // 设置下载进度
    setDownloadProgress(state: BilibiliDownloadInitialState, action: PayloadAction<MessageEventData>): void {
      const { type, qid, data }: MessageEventData = action.payload;

      if (type === 'progress') {
        state.downloadProgress[qid] = data;
      } else if (type === 'success') {
        delete state.downloadProgress[qid]; // 下载完成
      }

      state.downloadProgress = { ...state.downloadProgress };
    }
  }
});

export const { setAddDownloadList, setDeleteDownloadList, setDownloadProgress }: CaseReducerActions<CaseReducers> = actions;
export default { bilibiliDownload: reducer };