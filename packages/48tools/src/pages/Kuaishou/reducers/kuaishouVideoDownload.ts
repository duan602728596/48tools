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
type KuaishouDownloadEntityState = EntityState<DownloadItem, string>;

export const kuaishouDownloadListAdapter: EntityAdapter<DownloadItem, string> = createEntityAdapter({
  selectId: (item: DownloadItem): string => item.qid
});
export const kuaishouDownloadListSelectors: EntitySelectors<DownloadItem, KuaishouDownloadEntityState, string>
  = kuaishouDownloadListAdapter.getSelectors();

export interface KuaishouVideoDownloadInitialState extends KuaishouDownloadEntityState {
  downloadProgress: Record<string, ProgressSet>;
}

type SliceReducers = {
  setAddVideoDownloadList: CaseReducer<KuaishouVideoDownloadInitialState, PayloadAction<DownloadItem>>;
  setDeleteVideoDownloadList: CaseReducer<KuaishouVideoDownloadInitialState, PayloadAction<string>>;
  setDownloadProgress: CaseReducer<KuaishouVideoDownloadInitialState, PayloadAction<MessageEventData>>;
};

const sliceName: 'kuaishouVideoDownload' = 'kuaishouVideoDownload';
const { actions, reducer }: Slice<KuaishouVideoDownloadInitialState, SliceReducers, typeof sliceName> = createSlice({
  name: sliceName,
  initialState: kuaishouDownloadListAdapter.getInitialState({
    downloadProgress: {} // 下载进度
  }),
  reducers: {
    setAddVideoDownloadList: kuaishouDownloadListAdapter.addOne,       // 添加下载
    setDeleteVideoDownloadList: kuaishouDownloadListAdapter.removeOne, // 删除下载

    // 设置下载进度
    setDownloadProgress(state: KuaishouVideoDownloadInitialState, action: PayloadAction<MessageEventData>): void {
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
      }
    }
  }
});

export const {
  setAddVideoDownloadList,
  setDeleteVideoDownloadList,
  setDownloadProgress
}: CaseReducerActions<SliceReducers, typeof sliceName> = actions;
export default { [sliceName]: reducer };