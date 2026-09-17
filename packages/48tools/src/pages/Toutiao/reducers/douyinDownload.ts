import {
  createSlice,
  createEntityAdapter,
  type Slice,
  type PayloadAction,
  type CaseReducer,
  type CaseReducerActions,
  type EntityAdapter,
  type EntityState,
  type EntitySelectors
} from '@reduxjs/toolkit';
import { ProgressSet } from '../../../components/ProgressNative/index';
import type { DownloadItem } from '../types';
import type { MessageEventData } from '../../../utils/worker/download.worker/download.worker';

// 下载列表
type DouyinDownloadEntityState = EntityState<DownloadItem, string>;

export const douyinDownloadListAdapter: EntityAdapter<DownloadItem, string> = createEntityAdapter({
  selectId: (item: DownloadItem): string => item.qid
});
export const douyinDownloadListSelectors: EntitySelectors<DownloadItem, DouyinDownloadEntityState, string>
  = douyinDownloadListAdapter.getSelectors();

export interface DouyinDownloadInitialState extends DouyinDownloadEntityState {
  downloadProgress: Record<string, ProgressSet>;
  downloadCompleted: Record<string, boolean>;
}

type SliceReducers = {
  setAddDownloadList: CaseReducer<DouyinDownloadInitialState, PayloadAction<DownloadItem>>;
  setAddDownloadListAll: CaseReducer<DouyinDownloadInitialState, PayloadAction<DownloadItem[]>>;
  setDeleteDownloadList: CaseReducer<DouyinDownloadInitialState, PayloadAction<string>>;
  setStartDownload: CaseReducer<DouyinDownloadInitialState, PayloadAction<string>>;
  setDownloadProgress: CaseReducer<DouyinDownloadInitialState, PayloadAction<MessageEventData>>;
};

const sliceName: 'douyinDownload' = 'douyinDownload';
const { actions, reducer }: Slice<DouyinDownloadInitialState, SliceReducers, typeof sliceName> = createSlice({
  name: sliceName,
  initialState: douyinDownloadListAdapter.getInitialState({
    downloadProgress: {},  // 下载进度
    downloadCompleted: {}  // 下载完成状态
  }),
  reducers: {
    setAddDownloadList: douyinDownloadListAdapter.addOne,       // 添加下载
    setAddDownloadListAll: douyinDownloadListAdapter.addMany,   // 添加下载列表

    // 删除下载，同时清理对应的运行状态
    setDeleteDownloadList(state: DouyinDownloadInitialState, action: PayloadAction<string>): void {
      const qid: string = action.payload;

      douyinDownloadListAdapter.removeOne(state, action);
      delete state.downloadProgress[qid];
      delete state.downloadCompleted[qid];
      state.downloadProgress = { ...state.downloadProgress };
      state.downloadCompleted = { ...state.downloadCompleted };
    },

    // 开始重新下载时清理上一次的完成状态
    setStartDownload(state: DouyinDownloadInitialState, action: PayloadAction<string>): void {
      const qid: string = action.payload;

      delete state.downloadCompleted[qid];
      state.downloadCompleted = { ...state.downloadCompleted };
    },

    // 设置下载进度
    setDownloadProgress(state: DouyinDownloadInitialState, action: PayloadAction<MessageEventData>): void {
      const { type, qid, data }: MessageEventData = action.payload;

      if (type === 'progress') {
        if (!state.downloadProgress[qid]) {
          state.downloadProgress[qid] = new ProgressSet(qid);
          state.downloadProgress = { ...state.downloadProgress };
        }

        state.downloadProgress[qid].value = data;
      } else if (type === 'success') {
        delete state.downloadProgress[qid]; // 下载完成
        state.downloadProgress = { ...state.downloadProgress };
        state.downloadCompleted[qid] = true;
        state.downloadCompleted = { ...state.downloadCompleted };
      }
    }
  }
});

export const {
  setAddDownloadList,
  setAddDownloadListAll,
  setDeleteDownloadList,
  setStartDownload,
  setDownloadProgress
}: CaseReducerActions<SliceReducers, typeof sliceName> = actions;
export default { [sliceName]: reducer };
