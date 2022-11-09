import {
  createSlice,
  createEntityAdapter,
  type Slice,
  type SliceCaseReducers,
  type EntityAdapter,
  type EntityState,
  type EntitySelectors,
  type PayloadAction
} from '@reduxjs/toolkit';
import type { DownloadItem } from '../types';
import type { MessageEventData } from '../../Bilibili/Download/downloadBilibiliVideo.worker/downloadBilibiliVideo.worker';

// 下载列表
export const douyinDownloadListAdapter: EntityAdapter<DownloadItem> = createEntityAdapter({
  selectId: (item: DownloadItem): string => item.qid
});
export const douyinDownloadListSelectors: EntitySelectors<DownloadItem, EntityState<DownloadItem>>
  = douyinDownloadListAdapter.getSelectors();

export interface DouyinDownloadInitialState extends EntityState<DownloadItem> {
  downloadProgress: Record<string, number>;
}

type CaseReducers = SliceCaseReducers<DouyinDownloadInitialState>;

const { actions, reducer }: Slice = createSlice<DouyinDownloadInitialState, CaseReducers, 'douyinDownload'>({
  name: 'douyinDownload',
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
}: Record<string, Function> = actions;
export default { douyinDownload: reducer };