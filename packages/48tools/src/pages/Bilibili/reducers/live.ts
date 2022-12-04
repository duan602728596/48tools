import { createSlice, type Slice, type SliceCaseReducers, type PayloadAction } from '@reduxjs/toolkit';
import type { DataDispatchFunc, CursorDispatchFunc, QueryDispatchFunc } from '@indexeddb-tools/indexeddb-redux';
import IDBRedux, { bilibiliLiveObjectStoreName } from '../../../utils/IDB/IDBRedux';
import type { WebWorkerChildItem, IDBActionFunc } from '../../../commonTypes';
import type { LiveItem } from '../types';

export interface BilibiliLiveInitialState {
  bilibiliLiveList: Array<LiveItem>;
  liveChildList: Array<WebWorkerChildItem>;
}

type CaseReducers = SliceCaseReducers<BilibiliLiveInitialState>;

const { actions, reducer }: Slice = createSlice<BilibiliLiveInitialState, CaseReducers, 'bilibiliLive'>({
  name: 'bilibiliLive',
  initialState: {
    bilibiliLiveList: [], // 数据库内获取的直播间列表
    liveChildList: []     // 直播下载
  },
  reducers: {
    // 获取直播间列表
    setBilibiliLiveList(state: BilibiliLiveInitialState, action: PayloadAction<{ result: Array<LiveItem> }>): void {
      state.bilibiliLiveList = action.payload.result;
    },

    // 直播间列表内添加一个直播间
    setBilibiliLiveListAddRoom(state: BilibiliLiveInitialState, action: PayloadAction<{ data: LiveItem }>): void {
      state.bilibiliLiveList = state.bilibiliLiveList.concat([action.payload.data]);
    },

    // 直播间列表内删除一个直播间
    setBilibiliLiveListDeleteRoom(state: BilibiliLiveInitialState, action: PayloadAction<{ query: string }>): void {
      const index: number = state.bilibiliLiveList.findIndex((o: LiveItem): boolean => o.id === action.payload.query);

      if (index >= 0) {
        const newBilibiliLiveList: Array<LiveItem> = [...state.bilibiliLiveList];

        newBilibiliLiveList.splice(index, 1);
        state.bilibiliLiveList = newBilibiliLiveList;
      }
    },

    // 添加一个直播下载队列
    setAddLiveBilibiliChildList(state: BilibiliLiveInitialState, action: PayloadAction<WebWorkerChildItem>): void {
      state.liveChildList = state.liveChildList.concat([action.payload]);
    },

    // 删除一个直播下载队列
    setDeleteLiveBilibiliChildList(state: BilibiliLiveInitialState, action: PayloadAction<LiveItem>): void {
      const index: number = state.liveChildList.findIndex((o: WebWorkerChildItem): boolean => o.id === action.payload.id);

      if (index >= 0) {
        state.liveChildList.splice(index, 1);
        state.liveChildList = [...state.liveChildList];
      }
    }
  }
});

export const {
  setBilibiliLiveListAddRoom,
  setBilibiliLiveList,
  setBilibiliLiveListDeleteRoom,
  setAddLiveBilibiliChildList,
  setDeleteLiveBilibiliChildList
}: Record<string, Function> = actions;

// 保存数据
export const IDBSaveBilibiliLiveList: DataDispatchFunc = IDBRedux.putAction({
  objectStoreName: bilibiliLiveObjectStoreName,
  successAction: setBilibiliLiveListAddRoom as IDBActionFunc
});

// 请求所有列表
export const IDBCursorBilibiliLiveList: CursorDispatchFunc = IDBRedux.cursorAction({
  objectStoreName: bilibiliLiveObjectStoreName,
  successAction: setBilibiliLiveList as IDBActionFunc
});

// 删除
export const IDBDeleteBilibiliLiveList: QueryDispatchFunc = IDBRedux.deleteAction({
  objectStoreName: bilibiliLiveObjectStoreName,
  successAction: setBilibiliLiveListDeleteRoom as IDBActionFunc
});

export default { bilibiliLive: reducer };