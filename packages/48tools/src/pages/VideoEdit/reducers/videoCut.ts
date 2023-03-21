import { createSlice, type Slice, type PayloadAction, type CaseReducer, type CaseReducerActions } from '@reduxjs/toolkit';
import type { WebWorkerChildItem } from '../../../commonTypes';
import type { CutItem } from '../types';

export interface VideoCutInitialState {
  cutList: Array<CutItem>;
  cutChildList: Array<WebWorkerChildItem>;
}

type SliceReducers = {
  setCutListAdd: CaseReducer<VideoCutInitialState, PayloadAction<CutItem>>;
  setCutListDelete: CaseReducer<VideoCutInitialState, PayloadAction<CutItem>>;
  setCutChildListAdd: CaseReducer<VideoCutInitialState, PayloadAction<WebWorkerChildItem>>;
  setCutChildListDelete: CaseReducer<VideoCutInitialState, PayloadAction<WebWorkerChildItem>>;
};

const sliceName: 'videoCut' = 'videoCut';
const { actions, reducer }: Slice<VideoCutInitialState, SliceReducers, typeof sliceName> = createSlice({
  name: 'videoCut',
  initialState: {
    cutList: [],     // 视频裁剪队列
    cutChildList: [] // 裁剪线程
  },
  reducers: {
    // 添加一个队列
    setCutListAdd(state: VideoCutInitialState, action: PayloadAction<CutItem>): void {
      state.cutList = state.cutList.concat([action.payload]);
    },

    // 删除一个队列
    setCutListDelete(state: VideoCutInitialState, action: PayloadAction<CutItem>): void {
      const index: number = state.cutList.findIndex((o: CutItem): boolean => o.id === action.payload.id);

      if (index >= 0) {
        state.cutList.splice(index, 1);
        state.cutList = [...state.cutList];
      }
    },

    // 添加一个裁剪线程
    setCutChildListAdd(state: VideoCutInitialState, action: PayloadAction<WebWorkerChildItem>): void {
      state.cutChildList = state.cutChildList.concat([action.payload]);
    },

    // 删除一个裁剪线程
    setCutChildListDelete(state: VideoCutInitialState, action: PayloadAction<WebWorkerChildItem>): void {
      const index: number = state.cutChildList.findIndex((o: WebWorkerChildItem): boolean => o.id === action.payload.id);

      if (index >= 0) {
        state.cutChildList.splice(index, 1);
        state.cutChildList = [...state.cutChildList];
      }
    }
  }
});

export const {
  setCutListAdd,
  setCutListDelete,
  setCutChildListAdd,
  setCutChildListDelete
}: CaseReducerActions<SliceReducers, typeof sliceName> = actions;
export default { [sliceName]: reducer };