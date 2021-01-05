import { createSlice, Slice, SliceCaseReducers, PayloadAction, CaseReducerActions, ActionCreator } from '@reduxjs/toolkit';
import { findIndex } from 'lodash';
import type { ConcatItem } from '../types';

export interface ConcatInitialState {
  concatList: Array<ConcatItem>;
  concatWorker: Worker | null;
}

type CaseReducers = SliceCaseReducers<ConcatInitialState>;

const { actions, reducer }: Slice = createSlice<ConcatInitialState, CaseReducers>({
  name: 'concat',
  initialState: {
    concatList: [],    // 合并列表
    concatWorker: null // 合并线程
  },
  reducers: {
    // 添加视频合并队列
    setConcatListAdd(state: ConcatInitialState, action: PayloadAction<Array<ConcatItem>>): ConcatInitialState {
      state.concatList = state.concatList.concat(action.payload);

      return state;
    },

    // 设置合并队列
    setConcatList(state: ConcatInitialState, action: PayloadAction<Array<ConcatItem>>): ConcatInitialState {
      state.concatList = action.payload;

      return state;
    },

    // 删除
    setConcatListDelete(state: ConcatInitialState, action: PayloadAction<ConcatItem>): ConcatInitialState {
      const index: number = findIndex(state.concatList, { id: action.payload.id });

      if (index >= 0) {
        state.concatList.splice(index, 1);
        state.concatList = [...state.concatList];
      }

      return state;
    },

    // 设置合并线程
    setConcatWorker(state: ConcatInitialState, action: PayloadAction<Worker | null>): ConcatInitialState {
      state.concatWorker = action.payload;

      return state;
    }
  }
});

export const {
  setConcatListAdd,
  setConcatList,
  setConcatListDelete,
  setConcatWorker
}: CaseReducerActions<CaseReducers> = actions;
export default { concat: reducer };