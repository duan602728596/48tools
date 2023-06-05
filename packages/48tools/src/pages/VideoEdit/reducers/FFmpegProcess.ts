import {
  createSlice,
  createEntityAdapter,
  type Slice,
  type PayloadAction,
  type CaseReducer,
  type CaseReducerActions,
  type EntityAdapter,
  type EntityState,
  type EntitySelectors
} from '@reduxjs/toolkit';
import type { DataDispatchFunc, CursorDispatchFunc, QueryDispatchFunc } from '@indexeddb-tools/indexeddb-redux';
import IDBRedux, { ffmpegTemplateObjectStore } from '../../../utils/IDB/IDBRedux';
import type { ProcessItem, dbTemplateItem } from '../types';

// 下载列表
type FFmpegProcessEntityState = EntityState<ProcessItem, string>;

export const ffmpegProcessListAdapter: EntityAdapter<ProcessItem, string> = createEntityAdapter({
  selectId: (item: ProcessItem): string => item.id
});
export const ffmpegProcessListSelectors: EntitySelectors<ProcessItem, FFmpegProcessEntityState, string>
  = ffmpegProcessListAdapter.getSelectors();

export interface FFmpegProcessInitialState extends FFmpegProcessEntityState {
  dbTemplateList: Array<dbTemplateItem>;
}

type SliceReducers = {
  setAddProcess: CaseReducer<FFmpegProcessInitialState, PayloadAction<ProcessItem>>;
  setDeleteProcess: CaseReducer<FFmpegProcessInitialState, PayloadAction<string>>;
  setUpdateProcess: CaseReducer<FFmpegProcessInitialState, PayloadAction<{ id: string; changes: Partial<ProcessItem> }>>;
  setTemplateList: CaseReducer<FFmpegProcessInitialState, PayloadAction<{ result: Array<dbTemplateItem> }>>;
  setAddTemplate: CaseReducer<FFmpegProcessInitialState, PayloadAction<{ data: dbTemplateItem }>>;
  setDeleteTemplate: CaseReducer<FFmpegProcessInitialState, PayloadAction<{ query: string }>>;
};

const sliceName: 'FFmpegProcess' = 'FFmpegProcess';
const { actions, reducer }: Slice<FFmpegProcessInitialState, SliceReducers, typeof sliceName> = createSlice({
  name: sliceName,
  initialState: ffmpegProcessListAdapter.getInitialState({
    dbTemplateList: []
  }),
  reducers: {
    setAddProcess: ffmpegProcessListAdapter.addOne,
    setDeleteProcess: ffmpegProcessListAdapter.removeOne,
    setUpdateProcess: ffmpegProcessListAdapter.updateOne,

    // 获取template列表
    setTemplateList(state: FFmpegProcessInitialState, action: PayloadAction<{ result: Array<dbTemplateItem> }>): void {
      state.dbTemplateList = action.payload.result;
    },

    // 添加一个template
    setAddTemplate(state: FFmpegProcessInitialState, action: PayloadAction<{ data: dbTemplateItem }>): void {
      state.dbTemplateList = state.dbTemplateList.concat([action.payload.data]);
    },

    // 删除一个template
    setDeleteTemplate(state: FFmpegProcessInitialState, action: PayloadAction<{ query: string }>): void {
      const index: number = state.dbTemplateList.findIndex((o: dbTemplateItem): boolean => o.id === action.payload.query);

      if (index >= 0) {
        const newDBTemplateList: Array<dbTemplateItem> = [...state.dbTemplateList];

        newDBTemplateList.splice(index, 1);
        state.dbTemplateList = newDBTemplateList;
      }
    }
  }
});

export const {
  setAddProcess,
  setDeleteProcess,
  setUpdateProcess,
  setTemplateList,
  setAddTemplate,
  setDeleteTemplate
}: CaseReducerActions<SliceReducers, typeof sliceName> = actions;

// 保存数据
export const IDBSaveTemplateList: DataDispatchFunc = IDBRedux.putAction({
  objectStoreName: ffmpegTemplateObjectStore,
  successAction: setAddTemplate
});

// 请求所有列表
export const IDBCursorTemplateList: CursorDispatchFunc = IDBRedux.cursorAction({
  objectStoreName: ffmpegTemplateObjectStore,
  successAction: setTemplateList
});

// 删除数据
export const IDBDeleteTemplateList: QueryDispatchFunc = IDBRedux.deleteAction({
  objectStoreName: ffmpegTemplateObjectStore,
  successAction: setDeleteTemplate
});

export default { [sliceName]: reducer };