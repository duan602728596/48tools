import { createSlice, type Slice, type PayloadAction, type CaseReducer, type CaseReducerActions } from '@reduxjs/toolkit';
import type { DataDispatchFunc, CursorDispatchFunc, QueryDispatchFunc } from '@indexeddb-tools/indexeddb-redux';
import IDBRedux, { pocket48UserInfoObjectStoreName } from '../../../utils/IDB/IDBRedux';
import type { QingchunshikeUserItem } from '../types';

// 青春时刻
export interface QingchunshikeInitialState {
  userList: Array<QingchunshikeUserItem>;
}

type SliceReducers = {
  setQingchunshikeUserListFromDB: CaseReducer<QingchunshikeInitialState, PayloadAction<{ result: Array<QingchunshikeUserItem> }>>;
  setAddQingchunshikeUserItem: CaseReducer<QingchunshikeInitialState, PayloadAction<{ data: QingchunshikeUserItem }>>;
  setDeleteQingchunshikeUserItemFromDB: CaseReducer<QingchunshikeInitialState, PayloadAction<{ query: string }>>;
};

const sliceName: 'qingchunshike' = 'qingchunshike';
const { actions, reducer }: Slice<QingchunshikeInitialState, SliceReducers, typeof sliceName> = createSlice({
  name: sliceName,
  initialState: {
    userList: []
  },
  reducers: {
    // 从数据库里查
    setQingchunshikeUserListFromDB(state: QingchunshikeInitialState, action: PayloadAction<{ result: Array<QingchunshikeUserItem> }>): void {
      state.userList = action.payload.result;
    },

    // 添加
    setAddQingchunshikeUserItem(state: QingchunshikeInitialState, action: PayloadAction<{ data: QingchunshikeUserItem }>): void {
      state.userList = state.userList.concat([action.payload.data]);
    },

    // 删除
    setDeleteQingchunshikeUserItemFromDB(state: QingchunshikeInitialState, action: PayloadAction<{ query: string }>): void {
      const index: number = state.userList.findIndex((o: QingchunshikeUserItem): boolean => o.id === action.payload.query);

      if (index >= 0) {
        const nextUserList: Array<QingchunshikeUserItem> = [...state.userList];

        nextUserList.splice(index, 1);
        state.userList = nextUserList;
      }
    }
  }
});

export const {
  setQingchunshikeUserListFromDB,
  setAddQingchunshikeUserItem,
  setDeleteQingchunshikeUserItemFromDB
}: CaseReducerActions<SliceReducers, typeof sliceName> = actions;

// 获取数据
export const IDBCursorQingchunshikeUserList: CursorDispatchFunc = IDBRedux.cursorAction({
  objectStoreName: pocket48UserInfoObjectStoreName,
  successAction: setQingchunshikeUserListFromDB
});

// 保存数据
export const IDBSaveQingchunshikeUserItem: DataDispatchFunc = IDBRedux.putAction({
  objectStoreName: pocket48UserInfoObjectStoreName,
  successAction: setAddQingchunshikeUserItem
});

// 删除数据
export const IDBDeleteQingchunshikeUserItem: QueryDispatchFunc = IDBRedux.deleteAction({
  objectStoreName: pocket48UserInfoObjectStoreName,
  successAction: setDeleteQingchunshikeUserItemFromDB
});

export default { [sliceName]: reducer };