import {
  createSlice,
  createAsyncThunk,
  type Slice,
  type SliceCaseReducers,
  type PayloadAction,
  type AsyncThunk,
  type ActionReducerMapBuilder
} from '@reduxjs/toolkit';
import type { QueryDispatchFunc, DataDispatchFunc } from '@indexeddb-tools/indexeddb-redux';
import IDBRedux, { optionsObjectStoreName } from '../../../utils/IDB/IDBRedux';
import { requestLiveList } from '../services/pocket48';
import type { RecordFieldData, RecordVideoDownloadWebWorkerItem } from '../types';
import type { WebWorkerChildItem } from '../../../commonTypes';
import type { LiveInfo, LiveData } from '../services/interface';
import type { MessageEventData } from '../../../utils/worker/FFmpegDownload.worker';

export interface Pocket48InitialState {
  liveList: Array<LiveInfo>;
  liveChildList: Array<WebWorkerChildItem>;
  autoGrabTimer: number | null;
  recordList: Array<LiveInfo>;
  recordNext: string;
  recordChildList: Array<RecordVideoDownloadWebWorkerItem>;
  recordFields: Array<RecordFieldData>;
  progress: Record<string, number>;
}

type CaseReducers = SliceCaseReducers<Pocket48InitialState>;

// 刷新直播列表
export const reqLiveList: AsyncThunk<Array<LiveInfo>, void, {}> = createAsyncThunk(
  'pocket48/获取直播列表',
  async function(payload: void, thunkAPI: any): Promise<Array<LiveInfo>> {
    const res: LiveData = await requestLiveList('0', true);

    return res.content.liveList;
  });

const { actions, reducer }: Slice = createSlice<Pocket48InitialState, CaseReducers, 'pocket48'>({
  name: 'pocket48',
  initialState: {
    liveList: [],        // 直播信息
    liveChildList: [],   // 直播下载
    autoGrabTimer: null, // 自动抓取
    recordList: [],      // 录播信息
    recordNext: '0',     // 记录录播分页位置
    recordChildList: [], // 录播下载
    recordFields: [{
      name: ['groupId'],
      value: '全部'
    }], // 表单保存到redux内
    progress: {} // 下载进度
  },
  reducers: {
    // 直播信息
    setLiveList(state: Pocket48InitialState, action: PayloadAction<Array<LiveInfo>>): void {
      state.liveList = action.payload;
    },

    // 添加直播下载
    setAddLiveChildList(state: Pocket48InitialState, action: PayloadAction<WebWorkerChildItem>): void {
      state.liveChildList = state.liveChildList.concat([action.payload]);
    },

    // 删除直播下载
    setDeleteLiveChildList(state: Pocket48InitialState, action: PayloadAction<LiveInfo>): void {
      const index: number = state.liveChildList.findIndex((o: WebWorkerChildItem): boolean => o.id === action.payload.liveId);

      if (index >= 0) {
        state.liveChildList.splice(index, 1);
        state.liveChildList = [...state.liveChildList];
      }
    },

    // 自动抓取定时器
    setAutoGrab(state: Pocket48InitialState, action: PayloadAction<number | null>): void {
      if (typeof action.payload === 'number') {
        state.autoGrabTimer = action.payload;
      } else {
        if (typeof state.autoGrabTimer === 'number') {
          clearInterval(state.autoGrabTimer);
        }

        state.autoGrabTimer = null;
      }
    },

    // 录播加载
    setRecordList(state: Pocket48InitialState, action: PayloadAction<{ next: string; data: Array<LiveInfo> }>): void {
      state.recordList = action.payload.data;
      state.recordNext = action.payload.next;
    },

    // 添加录播下载
    setAddRecordChildList(state: Pocket48InitialState, action: PayloadAction<RecordVideoDownloadWebWorkerItem>): void {
      state.recordChildList = state.recordChildList.concat([action.payload]);
    },

    // 删除录播下载
    setDeleteRecordChildList(state: Pocket48InitialState, action: PayloadAction<LiveInfo>): void {
      const index: number = state.recordChildList.findIndex(
        (o: RecordVideoDownloadWebWorkerItem): boolean => o.id === action.payload.liveId);

      if (index >= 0) {
        state.recordChildList.splice(index, 1);
        delete state.progress[action.payload.liveId];

        state.recordChildList = [...state.recordChildList];
        state.progress = { ...state.progress };
      }
    },

    // 设置field
    setRecordFields(state: Pocket48InitialState, action: PayloadAction<RecordFieldData[]>): void {
      state.recordFields = action.payload;
    },

    // 设置下载进度
    setDownloadProgress(state: Pocket48InitialState, action: PayloadAction<MessageEventData>): void {
      if (action.payload.type === 'progress') {
        state.progress[action.payload.qid] = action.payload.data;
      } else if (action.payload.type === 'close' && action.payload.qid) {
        delete state.progress[action.payload.qid];
      }

      state.progress = { ...state.progress };
    }
  },
  extraReducers(builder: ActionReducerMapBuilder<Pocket48InitialState>): void {
    builder.addCase(
      reqLiveList.fulfilled,
      function(state: Pocket48InitialState, action: PayloadAction<Array<LiveInfo>>): void {
        state.liveList = action.payload;
      });
  }
});

// 获取配置项目
export const IDBGetPocket48LiveOptions: QueryDispatchFunc = IDBRedux.getAction({
  objectStoreName: optionsObjectStoreName
});

// 保存
export const IDBSavePocket48LiveOptions: DataDispatchFunc = IDBRedux.putAction({
  objectStoreName: optionsObjectStoreName
});

export const {
  setLiveList,
  setAddLiveChildList,
  setDeleteLiveChildList,
  setAutoGrab,
  setRecordList,
  setAddRecordChildList,
  setDeleteRecordChildList,
  setRecordFields,
  setDownloadProgress
}: Record<string, Function> = actions;
export default { pocket48: reducer };