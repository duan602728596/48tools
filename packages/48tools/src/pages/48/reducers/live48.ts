import { createSlice, Slice, SliceCaseReducers, PayloadAction, CaseReducerActions } from '@reduxjs/toolkit';
import { findIndex } from 'lodash';
import type { InLiveWebWorkerItem, InVideoQuery, InVideoItem } from '../types';

export interface Live48InitialState {
  inLiveList: Array<InLiveWebWorkerItem>;
  inVideoQuery?: InVideoQuery;
  inVideoList: Array<InVideoItem>;
}

type CaseReducers = SliceCaseReducers<Live48InitialState>;

const { actions, reducer }: Slice = createSlice<Live48InitialState, CaseReducers>({
  name: 'live48',
  initialState: {
    inLiveList: [],          // 当前抓取的直播列表
    inVideoQuery: undefined, // 录播分页的查询条件
    inVideoList: []          // 当前的查找到的数据
  },
  reducers: {
    // 添加当前抓取的直播列表
    setAddInLiveList(state: Live48InitialState, action: PayloadAction<InLiveWebWorkerItem>): Live48InitialState {
      state.inLiveList = state.inLiveList.concat([action.payload]);

      return state;
    },

    // 当前直播设置为停止
    setStopInLiveList(state: Live48InitialState, action: PayloadAction<string>): Live48InitialState {
      const index: number = findIndex(state.inLiveList, { id: action.payload });

      if (index >= 0) {
        state.inLiveList[index].status = 0;
        state.inLiveList = [...state.inLiveList];
      }

      return state;
    },

    // 删除当前抓取的直播列表
    setDeleteInLiveList(state: Live48InitialState, action: PayloadAction<string>): Live48InitialState {
      const index: number = findIndex(state.inLiveList, { id: action.payload });

      if (index >= 0) {
        state.inLiveList.splice(index, 1);
        state.inLiveList = [...state.inLiveList];
      }

      return state;
    },

    // 设置分页的查询条件
    setInVideoQuery(state: Live48InitialState, action: PayloadAction<InVideoQuery>): Live48InitialState {
      state.inVideoQuery = Object.assign(state.inVideoQuery ?? {}, action.payload);

      return state;
    },

    // 设置录播列表
    setInVideoList(
      state: Live48InitialState,
      action: PayloadAction<{ data: Array<InVideoItem>; page: number; total: number }>
    ): Live48InitialState {
      const { payload }: { payload: { data: Array<InVideoItem>; page: number; total: number } } = action;

      state.inVideoList = payload.data;
      state.inVideoQuery = Object.assign<any, any>(state.inVideoQuery ?? {}, {
        page: payload.page,
        total: payload.total
      }) ;

      return state;
    }
  }
});

export const {
  setAddInLiveList,
  setStopInLiveList,
  setDeleteInLiveList,
  setInVideoQuery,
  setInVideoList
}: CaseReducerActions<CaseReducers> = actions;
export default { live48: reducer };