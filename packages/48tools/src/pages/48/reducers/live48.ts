import { createSlice, type Slice, type PayloadAction, type CaseReducer, type CaseReducerActions } from '@reduxjs/toolkit';
import type { DefaultOptionType } from 'rc-select/es/Select';
import type { OpenLiveInfo } from '@48tools-api/48';
import { ProgressSet } from '../../../components/ProgressNative/index';
import type { WebWorkerChildItem } from '../../../commonTypes';
import type { InLiveWebWorkerItemNoplayStreamPath, InVideoItem } from '../types';
import type { MessageEventData } from '../../../utils/worker/FFmpegDownload.worker/FFmpegDownload.worker';

export interface Live48InitialState {
  // 直播
  OpenLiveListOptions: Array<DefaultOptionType>;
  inLiveList: Array<InLiveWebWorkerItemNoplayStreamPath>;

  // 录播
  videoListChild: Array<WebWorkerChildItem>;
  progress: Record<string, ProgressSet>;
  inVideoQueryLiveType: string | undefined;
  snh48NextPage: number;
  bej48NextPage: number;
  gnz48NextPage: number;
  ckg48NextPage: number;
  cgt48NextPage: number;
  snh48InVideoList: Array<OpenLiveInfo>;
  bej48InVideoList: Array<OpenLiveInfo>;
  gnz48InVideoList: Array<OpenLiveInfo>;
  ckg48InVideoList: Array<OpenLiveInfo>;
  cgt48InVideoList: Array<OpenLiveInfo>;
}

type SliceReducers = {
  setOpenLiveListOptions: CaseReducer<Live48InitialState, PayloadAction<Array<DefaultOptionType>>>;
  setAddInLiveList: CaseReducer<Live48InitialState, PayloadAction<InLiveWebWorkerItemNoplayStreamPath>>;
  setStopInLiveList: CaseReducer<Live48InitialState, PayloadAction<string>>;
  setDeleteInLiveList: CaseReducer<Live48InitialState, PayloadAction<string>>;
  setVideoListChildAdd: CaseReducer<Live48InitialState, PayloadAction<WebWorkerChildItem>>;
  setVideoListChildDelete: CaseReducer<Live48InitialState, PayloadAction<OpenLiveInfo>>;
  setDownloadProgress: CaseReducer<Live48InitialState, PayloadAction<MessageEventData>>;
  setInVideoQueryLiveType: CaseReducer<Live48InitialState, PayloadAction<string>>;
  setInVideoGroupList: CaseReducer<Live48InitialState, PayloadAction<{
    liveType: string;
    data: Array<OpenLiveInfo>;
    nextPage: number;
  }>>;
};

const sliceName: 'live48' = 'live48';
const { actions, reducer }: Slice<Live48InitialState, SliceReducers, typeof sliceName> = createSlice({
  name: sliceName,
  initialState: {
    // 直播
    OpenLiveListOptions: [],
    inLiveList: [],          // 当前抓取的直播列表

    // 录播
    inVideoQuery: undefined, // 录播分页的查询条件
    videoListChild: [],      // 当前下载
    progress: {},            // 下载进度
    inVideoQueryLiveType: undefined,
    snh48NextPage: 0,
    bej48NextPage: 0,
    gnz48NextPage: 0,
    ckg48NextPage: 0,
    cgt48NextPage: 0,
    snh48InVideoList: [],
    bej48InVideoList: [],
    gnz48InVideoList: [],
    ckg48InVideoList: [],
    cgt48InVideoList: []
  },
  reducers: {
    // 设置当前公演的列表
    setOpenLiveListOptions(state: Live48InitialState, action: PayloadAction<Array<DefaultOptionType>>): void {
      state.OpenLiveListOptions = action.payload;
    },

    // 添加当前抓取的直播列表
    setAddInLiveList(state: Live48InitialState, action: PayloadAction<InLiveWebWorkerItemNoplayStreamPath>): void {
      state.inLiveList = state.inLiveList.concat([action.payload]);
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

    // 添加视频下载
    setVideoListChildAdd(state: Live48InitialState, action: PayloadAction<WebWorkerChildItem>): void {
      state.videoListChild = state.videoListChild.concat([action.payload]);
    },

    // 删除视频下载
    setVideoListChildDelete(state: Live48InitialState, action: PayloadAction<OpenLiveInfo>): void {
      const index: number = state.videoListChild.findIndex(
        (o: WebWorkerChildItem): boolean => o.id === action.payload.liveId);

      if (index >= 0) {
        state.videoListChild.splice(index, 1);
        delete state.progress[action.payload.liveId];

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
    },

    // 设置videoQueryLiveType
    setInVideoQueryLiveType(state: Live48InitialState, action: PayloadAction<string>): void {
      state.inVideoQueryLiveType = action.payload;
    },

    // 设置录播列表
    setInVideoGroupList(state: Live48InitialState, action: PayloadAction<{
      liveType: string;
      data: Array<OpenLiveInfo>;
      nextPage: number;
    }>): void {
      state[`${ action.payload.liveType }InVideoList`] = action.payload.data;
      state[`${ action.payload.liveType }NextPage`] = action.payload.nextPage;
    }
  }
});

export const {
  setOpenLiveListOptions,
  setAddInLiveList,
  setStopInLiveList,
  setDeleteInLiveList,
  setVideoListChildAdd,
  setVideoListChildDelete,
  setDownloadProgress,
  setInVideoQueryLiveType,
  setInVideoGroupList
}: CaseReducerActions<SliceReducers, typeof sliceName> = actions;
export default { [sliceName]: reducer };