import { createSlice, Slice, SliceCaseReducers, PayloadAction, CaseReducerActions } from '@reduxjs/toolkit';
import { findIndex } from 'lodash-es';
import type { DownloadItem } from '../types';

export interface AcFunDownloadInitialState {
  downloadList: Array<DownloadItem>;
}

type CaseReducers = SliceCaseReducers<AcFunDownloadInitialState>;

const { actions, reducer }: Slice = createSlice<AcFunDownloadInitialState, CaseReducers>({
  name: 'acfunDownload',
  initialState: {
    downloadList: [] // acfun下载列表
  },
  reducers: {
    // 添加一个下载
    setAddDownloadList(state: AcFunDownloadInitialState, action: PayloadAction<DownloadItem>): AcFunDownloadInitialState {
      state.downloadList = state.downloadList.concat([action.payload]);

      return state;
    },

    // 删除一个下载
    setDeleteDownloadList(state: AcFunDownloadInitialState, action: PayloadAction<DownloadItem>): AcFunDownloadInitialState {
      const index: number = findIndex(state.downloadList, { qid: action.payload.qid });

      if (index >= 0) {
        state.downloadList.splice(index, 1);
        state.downloadList = [... state.downloadList];
      }

      return state;
    }
  }
});

export const { setAddDownloadList, setDeleteDownloadList }: CaseReducerActions<CaseReducers> = actions;
export default { acfunDownload: reducer };