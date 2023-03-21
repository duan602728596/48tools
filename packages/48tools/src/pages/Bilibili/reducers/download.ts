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
import type { DownloadItem } from '../types';
import type { MessageEventData } from '../Download/function/downloadBilibiliVideo.worker/downloadBilibiliVideo.worker';

// 下载列表
export const bilibiliDownloadListAdapter: EntityAdapter<DownloadItem> = createEntityAdapter({
  selectId: (item: DownloadItem): string => item.qid
});
export const bilibiliDownloadListSelectors: EntitySelectors<DownloadItem, EntityState<DownloadItem>>
  = bilibiliDownloadListAdapter.getSelectors();

export interface BilibiliDownloadInitialState extends EntityState<DownloadItem> {
  downloadProgress: { [key: string]: number };
}

type SliceReducers = {
  setAddDownloadList: CaseReducer<BilibiliDownloadInitialState, PayloadAction<DownloadItem>>;
  setDeleteDownloadList: CaseReducer<BilibiliDownloadInitialState, PayloadAction<string>>;
  setDownloadProgress: CaseReducer<BilibiliDownloadInitialState, PayloadAction<MessageEventData>>;
};

const sliceName: 'bilibiliDownload' = 'bilibiliDownload';
const { actions, reducer }: Slice<BilibiliDownloadInitialState, SliceReducers, typeof sliceName> = createSlice({
  name: sliceName,
  initialState: bilibiliDownloadListAdapter.getInitialState({
    downloadProgress: {} // 下载进度
  }),
  reducers: {
    setAddDownloadList: bilibiliDownloadListAdapter.addOne,       // 添加下载
    setDeleteDownloadList: bilibiliDownloadListAdapter.removeOne, // 删除下载

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

export const {
  setAddDownloadList,
  setDeleteDownloadList,
  setDownloadProgress
}: CaseReducerActions<SliceReducers, typeof sliceName> = actions;
export default { [sliceName]: reducer };