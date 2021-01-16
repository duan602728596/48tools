import { createSlice, Slice, SliceCaseReducers, PayloadAction, CaseReducerActions, ActionCreator } from '@reduxjs/toolkit';
import { findIndex } from 'lodash-es';
import dbRedux, { acfunLiveObjectStoreName } from '../../../utils/idb/dbRedux';
import type { WebWorkerChildItem } from '../../../types';
import type { LiveItem } from '../types';

export interface AcFunLiveInitialState {
  acfunLiveList: Array<LiveItem>;
  liveWorkers: Array<WebWorkerChildItem>;
}

type CaseReducers = SliceCaseReducers<AcFunLiveInitialState>;

const { actions, reducer }: Slice = createSlice<AcFunLiveInitialState, CaseReducers>({
  name: 'acfunLive',
  initialState: {
    acfunLiveList: [], // 配置的acfun直播间信息
    liveWorkers: []    // 正在录制的线程
  },
  reducers: {
    // 获取直播间列表
    setAcFunLiveList(state: AcFunLiveInitialState, action: PayloadAction<{ result: Array<LiveItem> }>): AcFunLiveInitialState {
      state.acfunLiveList = action.payload.result;

      return state;
    },

    // 直播间列表内添加一个直播间
    setAcFunLiveListAddRoom(state: AcFunLiveInitialState, action: PayloadAction<{ data: LiveItem }>): AcFunLiveInitialState {
      state.acfunLiveList = state.acfunLiveList.concat([action.payload.data]);

      return state;
    },

    // 直播间列表内删除一个直播间
    setAcFunListDeleteRoom(state: AcFunLiveInitialState, action: PayloadAction<{ query: string }>): AcFunLiveInitialState {
      const index: number = findIndex(state.acfunLiveList, { id: action.payload.query });

      if (index >= 0) {
        const newBilibiliLiveList: Array<LiveItem> = [...state.acfunLiveList];

        newBilibiliLiveList.splice(index, 1);
        state.acfunLiveList = newBilibiliLiveList;
      }

      return state;
    },

    // 添加一个直播下载队列
    setAddLiveWorker(state: AcFunLiveInitialState, action: PayloadAction<WebWorkerChildItem>): AcFunLiveInitialState {
      state.liveWorkers = state.liveWorkers.concat([action.payload]);

      return state;
    },

    // 删除一个直播下载队列
    setDeleteLiveWorker(state: AcFunLiveInitialState, action: PayloadAction<LiveItem>): AcFunLiveInitialState {
      const index: number = findIndex(state.liveWorkers, { id: action.payload.id });

      if (index >= 0) {
        state.liveWorkers.splice(index, 1);
        state.liveWorkers = [...state.liveWorkers];
      }

      return state;
    }
  }
});

export const {
  setAcFunLiveList,
  setAcFunLiveListAddRoom,
  setAcFunListDeleteRoom,
  setAddLiveWorker,
  setDeleteLiveWorker
}: CaseReducerActions<CaseReducers> = actions;

// 保存数据
export const idbSaveAcFunLiveList: ActionCreator<any> = dbRedux.putAction({
  objectStoreName: acfunLiveObjectStoreName,
  successAction: setAcFunLiveListAddRoom
});

// 请求所有列表
export const idbCursorAcFunLiveList: ActionCreator<any> = dbRedux.cursorAction({
  objectStoreName: acfunLiveObjectStoreName,
  successAction: setAcFunLiveList
});

// 删除
export const idbDeleteAcFunLiveList: ActionCreator<any> = dbRedux.deleteAction({
  objectStoreName: acfunLiveObjectStoreName,
  successAction: setAcFunListDeleteRoom
});

export default { acfunLive: reducer };