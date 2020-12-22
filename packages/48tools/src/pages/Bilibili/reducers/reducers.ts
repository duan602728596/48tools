import { createSlice, Slice, SliceCaseReducers, PayloadAction, CaseReducerActions, ActionCreator } from '@reduxjs/toolkit';
import { findIndex } from 'lodash';
import dbRedux, { bilibiliLiveObjectStoreName } from '../../../utils/idb/dbRedux';
import type { DownloadItem, LiveItem } from '../types';

export interface BilibiliInitialState {
  downloadList: Array<DownloadItem>;
  downloadProgress: { [key: string]: number };
  bilibiliLiveList: Array<LiveItem>;
}

type CaseReducers = SliceCaseReducers<BilibiliInitialState>;

const { actions, reducer }: Slice = createSlice<BilibiliInitialState, CaseReducers>({
  name: 'bilibili',
  initialState: {
    downloadList: [],     // 下载列表
    downloadProgress: {}, // 下载进度
    bilibiliLiveList: []  // 数据库内获取的直播间列表
  },
  reducers: {
    // 设置下载列表
    setDownloadList(state: BilibiliInitialState, action: PayloadAction<Array<DownloadItem>>): BilibiliInitialState {
      state.downloadList = action.payload;

      return state;
    },

    // 设置下载进度
    setDownloadProgress(state: BilibiliInitialState, action: PayloadAction<{ [key: string]: number }>): BilibiliInitialState {
      state.downloadProgress = action.payload;

      return state;
    },

    // 直播间列表内添加一个直播间
    setBilibiliLiveListAddRoom(state: BilibiliInitialState, action: PayloadAction<{ data: LiveItem }>): BilibiliInitialState {
      state.bilibiliLiveList = state.bilibiliLiveList.concat([action.payload.data]);

      return state;
    },

    // 获取直播间列表
    setBilibiliLiveList(state: BilibiliInitialState, action: PayloadAction<{ result: Array<LiveItem> }>): BilibiliInitialState {
      state.bilibiliLiveList = action.payload.result;

      return state;
    },

    // 直播间列表内删除一个直播间
    setBilibiliLiveListDeleteRoom(state: BilibiliInitialState, action: PayloadAction<{ query: string }>): BilibiliInitialState {
      const index: number = findIndex(state.bilibiliLiveList, { id: action.payload.query });

      if (index >= 0) {
        const newBilibiliLiveList: Array<LiveItem> = [...state.bilibiliLiveList];

        newBilibiliLiveList.splice(index, 1);
        state.bilibiliLiveList = newBilibiliLiveList;
      }

      return state;
    }
  }
});

export const {
  setDownloadList,
  setDownloadProgress,
  setBilibiliLiveListAddRoom,
  setBilibiliLiveList,
  setBilibiliLiveListDeleteRoom
}: CaseReducerActions<CaseReducers> = actions;

// 保存数据
export const saveFormData: ActionCreator<any> = dbRedux.putAction({
  objectStoreName: bilibiliLiveObjectStoreName,
  successAction: setBilibiliLiveListAddRoom
});

// 请求所有列表
export const cursorFormData: ActionCreator<any> = dbRedux.cursorAction({
  objectStoreName: bilibiliLiveObjectStoreName,
  successAction: setBilibiliLiveList
});

// 删除
export const deleteFormData: ActionCreator<any> = dbRedux.deleteAction({
  objectStoreName: bilibiliLiveObjectStoreName,
  successAction: setBilibiliLiveListDeleteRoom
});

export default { bilibili: reducer };