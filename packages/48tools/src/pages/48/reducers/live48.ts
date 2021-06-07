import { createSlice, Slice, SliceCaseReducers, PayloadAction, CaseReducerActions } from '@reduxjs/toolkit';
import { findIndex } from 'lodash-es';
import type { InLiveWebWorkerItem, InVideoQuery, InVideoItem, InVideoWebWorkerItem } from '../types';

export interface Live48InitialState {
  inLiveList: Array<InLiveWebWorkerItem>;
  inVideoQuery?: InVideoQuery;
  inVideoList: Array<InVideoItem>;
  videoListChild: Array<InVideoWebWorkerItem>;
}

type CaseReducers = SliceCaseReducers<Live48InitialState>;

const { actions, reducer }: Slice = createSlice<Live48InitialState, CaseReducers>({
  name: 'live48',
  initialState: {
    inLiveList: [],          // 当前抓取的直播列表
    inVideoQuery: undefined, // 录播分页的查询条件
    inVideoList: [],         // 当前的查找到的数据
    videoListChild: []       // 当前下载
  },
  reducers: {
    // 添加当前抓取的直播列表
    setAddInLiveList(state: Live48InitialState, action: PayloadAction<InLiveWebWorkerItem>): void {
      state.inLiveList = state.inLiveList.concat([action.payload]);
    },

    // 设置当前的worker，自动录制直播
    setAddWorkerInLiveList(state: Live48InitialState, action: PayloadAction<{ id: string; worker: Worker }>): void {
      const index: number = findIndex(state.inLiveList, { id: action.payload.id });

      if (index >= 0) {
        clearInterval(state.inLiveList[index].timer!);
        state.inLiveList[index].timer = undefined;
        state.inLiveList[index].worker = action.payload.worker;
        state.inLiveList = [...state.inLiveList];
      }
    },

    // 当前直播设置为停止
    setStopInLiveList(state: Live48InitialState, action: PayloadAction<string>): void {
      const index: number = findIndex(state.inLiveList, { id: action.payload });

      if (index >= 0) {
        state.inLiveList[index].status = 0;
        state.inLiveList = [...state.inLiveList];
      }
    },

    // 删除当前抓取的直播列表
    setDeleteInLiveList(state: Live48InitialState, action: PayloadAction<string>): void {
      const index: number = findIndex(state.inLiveList, { id: action.payload });

      if (index >= 0) {
        state.inLiveList.splice(index, 1);
        state.inLiveList = [...state.inLiveList];
      }
    },

    // 设置分页的查询条件
    setInVideoQuery(state: Live48InitialState, action: PayloadAction<InVideoQuery>): void {
      state.inVideoQuery = Object.assign(state.inVideoQuery ?? {}, action.payload);
    },

    // 设置录播列表
    setInVideoList(state: Live48InitialState, action: PayloadAction<{ data: InVideoItem[]; page: number; total: number }>): void {
      const { payload }: { payload: { data: Array<InVideoItem>; page: number; total: number } } = action;

      state.inVideoList = payload.data;
      state.inVideoQuery = Object.assign<any, any>(state.inVideoQuery ?? {}, {
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
      const index: number = findIndex(state.videoListChild, {
        id: action.payload.id,
        liveType: action.payload.liveType
      });

      if (index >= 0) {
        state.videoListChild.splice(index, 1);
        state.videoListChild = [...state.videoListChild];
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
  setVideoListChildDelete
}: CaseReducerActions<CaseReducers> = actions;
export default { live48: reducer };