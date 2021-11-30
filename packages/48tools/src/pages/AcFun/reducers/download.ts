import { createSlice, type Slice, type SliceCaseReducers, type PayloadAction, type CaseReducerActions } from '@reduxjs/toolkit';
import type { WebWorkerChildItem } from '../../../types';
import type { DownloadItem } from '../types';

export interface AcFunDownloadInitialState {
  downloadList: Array<DownloadItem>;
  ffmpegDownloadWorkers: Array<WebWorkerChildItem>;
}

type CaseReducers = SliceCaseReducers<AcFunDownloadInitialState>;

const { actions, reducer }: Slice = createSlice<AcFunDownloadInitialState, CaseReducers, 'acfunDownload'>({
  name: 'acfunDownload',
  initialState: {
    downloadList: [],         // acfun下载列表
    ffmpegDownloadWorkers: [] // 正在下载的线程
  },
  reducers: {
    // 添加一个下载
    setAddDownloadList(state: AcFunDownloadInitialState, action: PayloadAction<DownloadItem>): void {
      state.downloadList = state.downloadList.concat([action.payload]);
    },

    // 删除一个下载
    setDeleteDownloadList(state: AcFunDownloadInitialState, action: PayloadAction<DownloadItem>): void {
      const index: number = state.downloadList.findIndex((o: DownloadItem): boolean => o.qid === action.payload.qid);

      if (index >= 0) {
        state.downloadList.splice(index, 1);
        state.downloadList = [... state.downloadList];
      }
    },

    // 添加一个下载线程
    setAddDownloadWorker(state: AcFunDownloadInitialState, action: PayloadAction<WebWorkerChildItem>): void {
      state.ffmpegDownloadWorkers = state.ffmpegDownloadWorkers.concat([action.payload]);
    },

    // 删除一个下载线程
    setDeleteDownloadWorker(state: AcFunDownloadInitialState, action: PayloadAction<DownloadItem>): void {
      const index: number = state.ffmpegDownloadWorkers.findIndex((o: WebWorkerChildItem): boolean => o.id === action.payload.qid);

      if (index >= 0) {
        state.ffmpegDownloadWorkers.splice(index, 1);
        state.ffmpegDownloadWorkers = [...state.ffmpegDownloadWorkers];
      }
    }
  }
});

export const {
  setAddDownloadList,
  setDeleteDownloadList,
  setAddDownloadWorker,
  setDeleteDownloadWorker
}: CaseReducerActions<CaseReducers> = actions;
export default { acfunDownload: reducer };