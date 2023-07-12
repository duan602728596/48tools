import type { Browser } from 'playwright-core';
import { createSlice, type Slice, type PayloadAction, type CaseReducer, type CaseReducerActions } from '@reduxjs/toolkit';
import type { LabeledValue } from '@48tools-types/antd';
import type { ServerApiItem, CustomMessageV2 } from '@48tools-api/48';
import type { QueryRecord, FormatCustomMessage } from '../types';

export interface RoomMessageInitialState {
  searchSelectValue: LabeledValue | undefined; // 搜索的值
  searchServerResult: Array<ServerApiItem>;    // 搜索的结果
  query: QueryRecord | {};                     // 查询条件
  homeMessage: Array<FormatCustomMessage>;     // 查询结果
  homeMessageRaw: Array<CustomMessageV2>;      // 原始数据
  localMessageBrowser: Browser | null;         // 文件本地化
}

type SliceReducers = {
  setSearchSelectValue: CaseReducer<RoomMessageInitialState, PayloadAction<LabeledValue | undefined>>;
  setSearchServerResult: CaseReducer<RoomMessageInitialState, PayloadAction<ServerApiItem[]>>;
  setQueryRecord: CaseReducer<RoomMessageInitialState, PayloadAction<QueryRecord>>;
  setHomeMessage: CaseReducer<RoomMessageInitialState, PayloadAction<{
    formatData: FormatCustomMessage[];
    rawData: CustomMessageV2[];
  }>>;
  setLocalMessageBrowser: CaseReducer<RoomMessageInitialState, PayloadAction<Browser | null>>;
};

const sliceName: 'roomMessage' = 'roomMessage';
const { actions, reducer }: Slice<RoomMessageInitialState, SliceReducers, typeof sliceName> = createSlice({
  name: sliceName,
  initialState: {
    searchSelectValue: undefined,
    searchServerResult: [],
    query: {},
    homeMessage: [],
    homeMessageRaw: [],
    localMessageBrowser: null // 文件本地化的状态
  },
  reducers: {
    setSearchSelectValue(state: RoomMessageInitialState, action: PayloadAction<LabeledValue | undefined>): void {
      state.searchSelectValue = action.payload;
    },

    setSearchServerResult(state: RoomMessageInitialState, action: PayloadAction<ServerApiItem[]>): void {
      state.searchServerResult = action.payload;
    },

    setQueryRecord(state: RoomMessageInitialState, action: PayloadAction<QueryRecord>): void {
      state.query = action.payload;
    },

    setHomeMessage(
      state: RoomMessageInitialState,
      action: PayloadAction<{ formatData: FormatCustomMessage[]; rawData: CustomMessageV2[] }>
    ): void {
      state.homeMessage = action.payload.formatData;
      state.homeMessageRaw = action.payload.rawData;
    },

    setLocalMessageBrowser(state: RoomMessageInitialState, action: PayloadAction<Browser | null>): void {
      state.localMessageBrowser = action.payload;
    }
  }
});

export const {
  setSearchSelectValue,
  setSearchServerResult,
  setQueryRecord,
  setHomeMessage,
  setLocalMessageBrowser
}: CaseReducerActions<SliceReducers, typeof sliceName> = actions;
export default { [sliceName]: reducer };