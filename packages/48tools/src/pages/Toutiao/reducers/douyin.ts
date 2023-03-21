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
import type { MessageEventData } from '../../Bilibili/Download/function/downloadBilibiliVideo.worker/downloadBilibiliVideo.worker';

// 下载列表
export const douyinDownloadListAdapter: EntityAdapter<DownloadItem> = createEntityAdapter({
  selectId: (item: DownloadItem): string => item.qid
});
export const douyinDownloadListSelectors: EntitySelectors<DownloadItem, EntityState<DownloadItem>>
  = douyinDownloadListAdapter.getSelectors();

export interface DouyinDownloadInitialState extends EntityState<DownloadItem> {
  downloadProgress: Record<string, number>;
}

type SliceReducers = {
  setAddDownloadList: CaseReducer<DouyinDownloadInitialState, PayloadAction<DownloadItem>>;
  setDeleteDownloadList: CaseReducer<DouyinDownloadInitialState, PayloadAction<string>>;
  setDownloadProgress: CaseReducer<DouyinDownloadInitialState, PayloadAction<MessageEventData>>;
};

const sliceName: 'douyinDownload' = 'douyinDownload';
const { actions, reducer }: Slice<DouyinDownloadInitialState, SliceReducers, typeof sliceName> = createSlice({
  name: sliceName,
  initialState: douyinDownloadListAdapter.getInitialState({
    downloadProgress: {} // 下载进度
  }),
  reducers: {
    setAddDownloadList: douyinDownloadListAdapter.addOne,       // 添加下载
    setDeleteDownloadList: douyinDownloadListAdapter.removeOne, // 删除下载

    // 设置下载进度
    setDownloadProgress(state: DouyinDownloadInitialState, action: PayloadAction<MessageEventData>): void {
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