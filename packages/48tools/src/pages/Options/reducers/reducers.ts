import { createSlice, Slice, SliceCaseReducers, PayloadAction, CaseReducerActions, ActionCreator } from '@reduxjs/toolkit';
import { differenceBy } from 'lodash';
import dbRedux, { objectStoreName } from '../../../function/dbInit/dbRedux';
import type { OptionsItem } from '../../../types';

export interface OptionsInitialState {
  optionsList: Array<OptionsItem>;
}

type CaseReducers = SliceCaseReducers<OptionsInitialState>;

const { actions, reducer }: Slice = createSlice<OptionsInitialState, CaseReducers>({
  name: 'options',
  initialState: {
    optionsList: []
  },
  reducers: {
    // 配置列表
    setOptionsList(state: OptionsInitialState, action: PayloadAction<{ result: Array<OptionsItem> }>): OptionsInitialState {
      state.optionsList = action.payload.result;

      return state;
    },

    // 删除配置
    setOptionsDeleteList(state: OptionsInitialState, action: PayloadAction<{ query: string }>): OptionsInitialState {
      const optionsList: Array<OptionsItem> = state.optionsList;
      const newList: Array<OptionsItem> = differenceBy<OptionsItem, { id: string }>(
        optionsList,
        [{ id: action.payload.query }],
        'id'
      );

      state.optionsList = newList;

      return state;
    }
  }
});

export const { setOptionsList, setOptionsDeleteList }: CaseReducerActions<CaseReducers> = actions;
export default { options: reducer };

// 保存数据
export const saveFormData: ActionCreator<any> = dbRedux.putAction({ objectStoreName });

// 配置列表
export const queryOptionsList: ActionCreator<any> = dbRedux.cursorAction({
  objectStoreName,
  successAction: setOptionsList
});

// 删除
export const deleteOption: ActionCreator<any> = dbRedux.deleteAction({
  objectStoreName,
  successAction: setOptionsDeleteList
});

// 获取单个配置
export const getOptionItem: ActionCreator<any> = dbRedux.getAction({ objectStoreName });