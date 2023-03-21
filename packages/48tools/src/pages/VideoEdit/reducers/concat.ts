import { createSlice, type Slice, type PayloadAction, type CaseReducer, type CaseReducerActions } from '@reduxjs/toolkit';
import type { ConcatItem } from '../types';

export interface ConcatInitialState {
  concatList: Array<ConcatItem>;
  concatWorker: Worker | null;
}

type SliceReducers = {
  setConcatListAdd: CaseReducer<ConcatInitialState, PayloadAction<Array<ConcatItem>>>;
  setConcatList: CaseReducer<ConcatInitialState, PayloadAction<Array<ConcatItem>>>;
  setConcatListDelete: CaseReducer<ConcatInitialState, PayloadAction<ConcatItem>>;
  setConcatWorker: CaseReducer<ConcatInitialState, PayloadAction<Worker | null>>;
};

const sliceName: 'concat' = 'concat';
const { actions, reducer }: Slice<ConcatInitialState, SliceReducers, typeof sliceName> = createSlice({
  name: 'concat',
  initialState: {
    concatList: [],    // 合并列表
    concatWorker: null // 合并线程
  },
  reducers: {
    // 添加视频合并队列
    setConcatListAdd(state: ConcatInitialState, action: PayloadAction<Array<ConcatItem>>): void {
      state.concatList = state.concatList.concat(action.payload);
    },

    // 设置合并队列
    setConcatList(state: ConcatInitialState, action: PayloadAction<Array<ConcatItem>>): void {
      state.concatList = action.payload;
    },

    // 删除
    setConcatListDelete(state: ConcatInitialState, action: PayloadAction<ConcatItem>): void {
      const index: number = state.concatList.findIndex((o: ConcatItem) => o.id === action.payload.id);

      if (index >= 0) {
        state.concatList.splice(index, 1);
        state.concatList = [...state.concatList];
      }
    },

    // 设置合并线程
    setConcatWorker(state: ConcatInitialState, action: PayloadAction<Worker | null>): void {
      state.concatWorker = action.payload;
    }
  }
});

export const {
  setConcatListAdd,
  setConcatList,
  setConcatListDelete,
  setConcatWorker
}: CaseReducerActions<SliceReducers, typeof sliceName> = actions;
export default { [sliceName]: reducer };