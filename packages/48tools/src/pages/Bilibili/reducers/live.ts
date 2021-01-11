import { createSlice, Slice, SliceCaseReducers, PayloadAction, CaseReducerActions, ActionCreator } from '@reduxjs/toolkit';
import { findIndex } from 'lodash-es';
import dbRedux, { bilibiliLiveObjectStoreName } from '../../../utils/idb/dbRedux';
import type { WebWorkerChildItem } from '../../../types';
import type { LiveItem } from '../types';

export interface BilibiliLiveInitialState {
  bilibiliLiveList: Array<LiveItem>;
  liveChildList: Array<WebWorkerChildItem>;
}

type CaseReducers = SliceCaseReducers<BilibiliLiveInitialState>;

const { actions, reducer }: Slice = createSlice<BilibiliLiveInitialState, CaseReducers>({
  name: 'bilibiliLive',
  initialState: {
    bilibiliLiveList: [], // 数据库内获取的直播间列表
    liveChildList: []     // 直播下载
  },
  reducers: {
    // 获取直播间列表
    setBilibiliLiveList(state: BilibiliLiveInitialState, action: PayloadAction<{ result: Array<LiveItem> }>): BilibiliLiveInitialState {
      state.bilibiliLiveList = action.payload.result;

      return state;
    },

    // 直播间列表内添加一个直播间
    setBilibiliLiveListAddRoom(state: BilibiliLiveInitialState, action: PayloadAction<{ data: LiveItem }>): BilibiliLiveInitialState {
      state.bilibiliLiveList = state.bilibiliLiveList.concat([action.payload.data]);

      return state;
    },

    // 直播间列表内删除一个直播间
    setBilibiliLiveListDeleteRoom(state: BilibiliLiveInitialState, action: PayloadAction<{ query: string }>): BilibiliLiveInitialState {
      const index: number = findIndex(state.bilibiliLiveList, { id: action.payload.query });

      if (index >= 0) {
        const newBilibiliLiveList: Array<LiveItem> = [...state.bilibiliLiveList];

        newBilibiliLiveList.splice(index, 1);
        state.bilibiliLiveList = newBilibiliLiveList;
      }

      return state;
    },

    // 添加一个直播下载队列
    setAddLiveBilibiliChildList(state: BilibiliLiveInitialState, action: PayloadAction<WebWorkerChildItem>): BilibiliLiveInitialState {
      state.liveChildList = state.liveChildList.concat([action.payload]);

      return state;
    },

    // 删除一个直播下载队列
    setDeleteLiveBilibiliChildList(state: BilibiliLiveInitialState, action: PayloadAction<LiveItem>): BilibiliLiveInitialState {
      const index: number = findIndex(state.liveChildList, { id: action.payload.id });

      if (index >= 0) {
        state.liveChildList.splice(index, 1);
        state.liveChildList = [...state.liveChildList];
      }

      return state;
    }
  }
});

export const {
  setBilibiliLiveListAddRoom,
  setBilibiliLiveList,
  setBilibiliLiveListDeleteRoom,
  setAddLiveBilibiliChildList,
  setDeleteLiveBilibiliChildList
}: CaseReducerActions<CaseReducers> = actions;

// 保存数据
export const idbSaveBilibiliLiveList: ActionCreator<any> = dbRedux.putAction({
  objectStoreName: bilibiliLiveObjectStoreName,
  successAction: setBilibiliLiveListAddRoom
});

// 请求所有列表
export const idbCursorBilibiliLiveList: ActionCreator<any> = dbRedux.cursorAction({
  objectStoreName: bilibiliLiveObjectStoreName,
  successAction: setBilibiliLiveList
});

// 删除
export const idbDeleteBilibiliLiveList: ActionCreator<any> = dbRedux.deleteAction({
  objectStoreName: bilibiliLiveObjectStoreName,
  successAction: setBilibiliLiveListDeleteRoom
});

export default { bilibiliLive: reducer };