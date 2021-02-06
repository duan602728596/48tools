import {
  createSlice,
  createAsyncThunk,
  Slice,
  SliceCaseReducers,
  PayloadAction,
  CaseReducerActions,
  ActionCreator,
  AsyncThunk
} from '@reduxjs/toolkit';
import { findIndex } from 'lodash-es';
import dbRedux, { optionsObjectStoreName } from '../../../utils/idb/dbRedux';
import { requestLiveList } from '../services/pocket48';
import type { WebWorkerChildItem } from '../../../types';
import type { LiveInfo, LiveData } from '../services/interface';

export interface Pocket48InitialState {
  liveList: Array<LiveInfo>;
  liveChildList: Array<WebWorkerChildItem>;
  autoGrabTimer: number | null;
  recordList: Array<LiveInfo>;
  recordNext: string;
  recordChildList: Array<WebWorkerChildItem>;
}

type CaseReducers = SliceCaseReducers<Pocket48InitialState>;

// 刷新直播列表
export const reqLiveList: AsyncThunk<Array<LiveInfo>, void, {}> = createAsyncThunk(
  'pocket48/获取直播列表',
  async function(payload: void, thunkAPI: any): Promise<Array<LiveInfo>> {
    const res: LiveData = await requestLiveList('0', true);

    return res.content.liveList;
  });

const { actions, reducer }: Slice = createSlice<Pocket48InitialState, CaseReducers>({
  name: 'pocket48',
  initialState: {
    liveList: [],        // 直播信息
    liveChildList: [],   // 直播下载
    autoGrabTimer: null, // 自动抓取
    recordList: [],      // 录播信息
    recordNext: '0',     // 记录录播分页位置
    recordChildList: []  // 录播下载
  },
  reducers: {
    // 直播信息
    setLiveList(state: Pocket48InitialState, action: PayloadAction<Array<LiveInfo>>): Pocket48InitialState {
      state.liveList = action.payload;

      return state;
    },

    // 添加直播下载
    setAddLiveChildList(state: Pocket48InitialState, action: PayloadAction<WebWorkerChildItem>): Pocket48InitialState {
      state.liveChildList = state.liveChildList.concat([action.payload]);

      return state;
    },

    // 删除直播下载
    setDeleteLiveChildList(state: Pocket48InitialState, action: PayloadAction<LiveInfo>): Pocket48InitialState {
      const index: number = findIndex(state.liveChildList, { id: action.payload.liveId });

      if (index >= 0) {
        state.liveChildList.splice(index, 1);
        state.liveChildList = [...state.liveChildList];
      }

      return state;
    },

    // 自动抓取定时器
    setAutoGrab(state: Pocket48InitialState, action: PayloadAction<number | null>): Pocket48InitialState {
      if (typeof action.payload === 'number') {
        state.autoGrabTimer = action.payload;
      } else {
        if (typeof state.autoGrabTimer === 'number') {
          clearInterval(state.autoGrabTimer);
        }

        state.autoGrabTimer = null;
      }

      return state;
    },

    // 录播加载
    setRecordList(
      state: Pocket48InitialState,
      action: PayloadAction<{ next: string; data: Array<LiveInfo> }>
    ): Pocket48InitialState {
      state.recordList = action.payload.data;
      state.recordNext = action.payload.next;

      return state;
    },

    // 添加录播下载
    setAddRecordChildList(state: Pocket48InitialState, action: PayloadAction<WebWorkerChildItem>): Pocket48InitialState {
      state.recordChildList = state.recordChildList.concat([action.payload]);

      return state;
    },

    // 删除录播下载
    setDeleteRecordChildList(state: Pocket48InitialState, action: PayloadAction<LiveInfo>): Pocket48InitialState {
      const index: number = findIndex(state.recordChildList, { id: action.payload.liveId });

      if (index >= 0) {
        state.recordChildList.splice(index, 1);
        state.recordChildList = [...state.recordChildList];
      }

      return state;
    }
  },
  extraReducers: {
    [reqLiveList.fulfilled as any](state: Pocket48InitialState, action: PayloadAction<Array<LiveInfo>>): void {
      state.liveList = action.payload;
    }
  }
});

// 获取配置项目
export const idbGetPocket48LiveOptions: ActionCreator<any> = dbRedux.getAction({ objectStoreName: optionsObjectStoreName });

// 保存
export const idbSavePocket48LiveOptions: ActionCreator<any> = dbRedux.putAction({ objectStoreName: optionsObjectStoreName });

export const {
  setLiveList,
  setAddLiveChildList,
  setDeleteLiveChildList,
  setAutoGrab,
  setRecordList,
  setAddRecordChildList,
  setDeleteRecordChildList
}: CaseReducerActions<CaseReducers> = actions;
export default { pocket48: reducer };