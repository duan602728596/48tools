import { createSlice, type Slice, type SliceCaseReducers, type PayloadAction } from '@reduxjs/toolkit';
import type { LabeledValue } from '@48tools-types/antd';
import type { ServerApiItem, CustomMessageV2 } from '../services/interface';
import type { QueryRecord, FormatCustomMessage } from '../types';

export interface RoomMessageInitialState {
  searchSelectValue: LabeledValue | undefined; // 搜索的值
  searchServerResult: Array<ServerApiItem>; // 搜索的结果
  query: QueryRecord | {}; // 查询条件
  homeMessage: Array<FormatCustomMessage>; // 查询结果
  homeMessageRaw: Array<CustomMessageV2>; // 原始数据
}

type CaseReducers = SliceCaseReducers<RoomMessageInitialState>;

const { actions, reducer }: Slice = createSlice<RoomMessageInitialState, CaseReducers, 'roomMessage'>({
  name: 'roomMessage',
  initialState: {
    searchSelectValue: undefined,
    searchServerResult: [],
    query: {},
    homeMessage: [],
    homeMessageRaw: []
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
    }
  }
});

export const {
  setSearchSelectValue,
  setSearchServerResult,
  setQueryRecord,
  setHomeMessage
}: Record<string, Function> = actions;
export default { roomMessage: reducer };