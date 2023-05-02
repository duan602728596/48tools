import { createSlice, type Slice, type PayloadAction, type CaseReducer, type CaseReducerActions } from '@reduxjs/toolkit';
import { ProgressSet } from '../../../components/ProgressNative/index';
import type { InLiveWebWorkerItemNoplayStreamPath, InVideoQuery, InVideoItem, InVideoWebWorkerItem } from '../types';
import type { MessageEventData } from '../../../utils/worker/FFmpegDownload.worker';

export interface Live48InitialState {
  inLiveList: Array<InLiveWebWorkerItemNoplayStreamPath>;
  inVideoQuery?: InVideoQuery;
  inVideoList: Array<InVideoItem>;
  videoListChild: Array<InVideoWebWorkerItem>;
  progress: Record<string, ProgressSet>;
}

type SliceReducers = {
  setAddInLiveList: CaseReducer<Live48InitialState, PayloadAction<InLiveWebWorkerItemNoplayStreamPath>>;
  setAddWorkerInLiveList: CaseReducer<Live48InitialState, PayloadAction<{ id: string; worker: Worker }>>;
  setStopInLiveList: CaseReducer<Live48InitialState, PayloadAction<string>>;
  setDeleteInLiveList: CaseReducer<Live48InitialState, PayloadAction<string>>;
  setInVideoQuery: CaseReducer<Live48InitialState, PayloadAction<InVideoQuery>>;
  setInVideoList: CaseReducer<Live48InitialState, PayloadAction<{ data: InVideoItem[]; page: number; total: number }>>;
  setVideoListChildAdd: CaseReducer<Live48InitialState, PayloadAction<InVideoWebWorkerItem>>;
  setVideoListChildDelete: CaseReducer<Live48InitialState, PayloadAction<InVideoItem>>;
  setDownloadProgress: CaseReducer<Live48InitialState, PayloadAction<MessageEventData>>;
};

const sliceName: 'live48' = 'live48';
const { actions, reducer }: Slice<Live48InitialState, SliceReducers, typeof sliceName> = createSlice({
  name: sliceName,
  initialState: {
    inLiveList: [],          // 当前抓取的直播列表
    inVideoQuery: undefined, // 录播分页的查询条件
    inVideoList: [],         // 当前的查找到的数据
    videoListChild: [],      // 当前下载
    progress: {} // 下载进度
  },
  reducers: {
    // 添加当前抓取的直播列表
    setAddInLiveList(state: Live48InitialState, action: PayloadAction<InLiveWebWorkerItemNoplayStreamPath>): void {
      state.inLiveList = state.inLiveList.concat([action.payload]);
    },

    // 设置当前的worker，自动录制直播
    setAddWorkerInLiveList(state: Live48InitialState, action: PayloadAction<{ id: string; worker: Worker }>): void {
      const index: number = state.inLiveList.findIndex((o: InLiveWebWorkerItemNoplayStreamPath): boolean => o.id === action.payload.id);

      if (index >= 0) {
        clearInterval(state.inLiveList[index].timer!);
        state.inLiveList[index].timer = undefined;
        state.inLiveList[index].worker = action.payload.worker;
        state.inLiveList = [...state.inLiveList];
      }
    },

    // 当前直播设置为停止
    setStopInLiveList(state: Live48InitialState, action: PayloadAction<string>): void {
      const index: number = state.inLiveList.findIndex((o: InLiveWebWorkerItemNoplayStreamPath): boolean => o.id === action.payload);

      if (index >= 0) {
        state.inLiveList[index].status = 0;
        state.inLiveList = [...state.inLiveList];
      }
    },

    // 删除当前抓取的直播列表
    setDeleteInLiveList(state: Live48InitialState, action: PayloadAction<string>): void {
      const index: number = state.inLiveList.findIndex((o: InLiveWebWorkerItemNoplayStreamPath): boolean => o.id === action.payload);

      if (index >= 0) {
        state.inLiveList.splice(index, 1);
        state.inLiveList = [...state.inLiveList];
      }
    },

    // 设置分页的查询条件
    setInVideoQuery(state: Live48InitialState, action: PayloadAction<InVideoQuery>): void {
      state.inVideoQuery = Object.assign<InVideoQuery, InVideoQuery>(state.inVideoQuery ?? {}, action.payload);
    },

    // 设置录播列表
    setInVideoList(state: Live48InitialState, action: PayloadAction<{ data: InVideoItem[]; page: number; total: number }>): void {
      const { payload }: { payload: { data: Array<InVideoItem>; page: number; total: number } } = action;

      state.inVideoList = payload.data;
      state.inVideoQuery = Object.assign<InVideoQuery, InVideoQuery>(state.inVideoQuery ?? {}, {
        page: payload.page,
        total: payload.total
      }) ;
    },

    // 添加视频下载
    setVideoListChildAdd(state: Live48InitialState, action: PayloadAction<InVideoWebWorkerItem>): void {
      state.videoListChild = state.videoListChild.concat([action.payload]);
    },

    // 删除视频下载
    setVideoListChildDelete(state: Live48InitialState, action: PayloadAction<InVideoItem>): void {
      const index: number = state.videoListChild.findIndex(
        (o: InVideoWebWorkerItem): boolean => o.id === action.payload.id && o.liveType === action.payload.liveType);

      if (index >= 0) {
        state.videoListChild.splice(index, 1);
        delete state.progress[action.payload.id];

        state.videoListChild = [...state.videoListChild];
        state.progress = { ...state.progress };
      }
    },

    // 设置下载进度
    setDownloadProgress(state: Live48InitialState, action: PayloadAction<MessageEventData>): void {
      if (action.payload.type === 'progress') {
        if (!state.progress[action.payload.qid]) {
          state.progress[action.payload.qid] = new ProgressSet(action.payload.qid);
          state.progress = { ...state.progress };
        }

        state.progress[action.payload.qid].value = action.payload.data;
      } else if (action.payload.type === 'close' && action.payload.qid) {
        delete state.progress[action.payload.qid]; // 下载完成
        state.progress = { ...state.progress };
      }
    }
  }
});

export const {
  setAddInLiveList,
  setAddWorkerInLiveList,
  setStopInLiveList,
  setDeleteInLiveList,
  setInVideoQuery,
  setInVideoList,
  setVideoListChildAdd,
  setVideoListChildDelete,
  setDownloadProgress
}: CaseReducerActions<SliceReducers, typeof sliceName> = actions;
export default { [sliceName]: reducer };