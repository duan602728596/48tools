import { createSlice, type Slice, type PayloadAction, type CaseReducer, type CaseReducerActions } from '@reduxjs/toolkit';
import { ProgressSet } from '../../../components/ProgressNative/index';
import type { WebWorkerChildItem } from '../../../commonTypes';
import type { DownloadItem } from '../types';
import type { MessageEventData } from '../../../utils/worker/FFmpeg/FFmpegDownload.worker';

export interface AcFunDownloadInitialState {
  downloadList: Array<DownloadItem>;
  ffmpegDownloadWorkers: Array<WebWorkerChildItem>;
  progress: Record<string, ProgressSet>;
}

type SliceReducers = {
  setAddDownloadList: CaseReducer<AcFunDownloadInitialState, PayloadAction<DownloadItem>>;
  setDeleteDownloadList: CaseReducer<AcFunDownloadInitialState, PayloadAction<DownloadItem>>;
  setAddDownloadWorker: CaseReducer<AcFunDownloadInitialState, PayloadAction<WebWorkerChildItem>>;
  setDeleteDownloadWorker: CaseReducer<AcFunDownloadInitialState, PayloadAction<DownloadItem>>;
  setDownloadProgress: CaseReducer<AcFunDownloadInitialState, PayloadAction<MessageEventData>>;
};

const sliceName: 'acfunDownload' = 'acfunDownload';
const { actions, reducer }: Slice<AcFunDownloadInitialState, SliceReducers, typeof sliceName> = createSlice({
  name: sliceName,
  initialState: {
    downloadList: [],          // acfun下载列表
    ffmpegDownloadWorkers: [], // 正在下载的线程
    progress: {} // 下载进度
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
      const index: number = state.ffmpegDownloadWorkers.findIndex(
        (o: WebWorkerChildItem): boolean => o.id === action.payload.qid);

      if (index >= 0) {
        state.ffmpegDownloadWorkers.splice(index, 1);
        delete state.progress[action.payload.qid];

        state.ffmpegDownloadWorkers = [...state.ffmpegDownloadWorkers];
        state.progress = { ...state.progress };
      }
    },

    // 设置下载进度
    setDownloadProgress(state: AcFunDownloadInitialState, action: PayloadAction<MessageEventData>): void {
      if (action.payload.type === 'progress') {
        if (!state.progress[action.payload.qid]) {
          state.progress[action.payload.qid] = new ProgressSet(action.payload.qid);
          state.progress = { ...state.progress };
        }

        state.progress[action.payload.qid].value = action.payload.data;
      } else if (action.payload.type === 'close' && action.payload.qid) {
        delete state.progress[action.payload.qid]; // 下载完成
        state.progress = { ...state.progress };
      }
    }
  }
});

export const {
  setAddDownloadList,
  setDeleteDownloadList,
  setAddDownloadWorker,
  setDeleteDownloadWorker,
  setDownloadProgress
}: CaseReducerActions<SliceReducers, typeof sliceName> = actions;
export default { [sliceName]: reducer };