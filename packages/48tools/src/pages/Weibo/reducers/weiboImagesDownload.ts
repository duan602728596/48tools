import { createSlice, type Slice, type PayloadAction, type CaseReducer, type CaseReducerActions } from '@reduxjs/toolkit';
import type { WeiboImageItem } from '../types';

type UpdateNextStatusPayload = Required<Pick<WeiboImagesDownloadInitialState, 'cookie' | 'accountId' | 'sinceId'>>;

export interface WeiboImagesDownloadInitialState {
  cookie: string | undefined;
  accountId: string | undefined;
  sinceId: string | undefined;
  list: Array<WeiboImageItem>;
}

type SliceReducers = {
  updateNextStatus: CaseReducer<WeiboImagesDownloadInitialState, PayloadAction<UpdateNextStatusPayload>>;
  setImagesList: CaseReducer<WeiboImagesDownloadInitialState, PayloadAction<{ sinceId: string; list: Array<WeiboImageItem>; isInit?: boolean }>>;
  setImageCheckedItem: CaseReducer<WeiboImagesDownloadInitialState, PayloadAction<string>>;
  setClearAllChecked: CaseReducer<WeiboImagesDownloadInitialState, PayloadAction<void>>;
};

type SliceSelectors = {
  cookie: (state: WeiboImagesDownloadInitialState) => string | undefined;
  accountId: (state: WeiboImagesDownloadInitialState) => string | undefined;
  sinceId: (state: WeiboImagesDownloadInitialState) => string | undefined;
  list: (state: WeiboImagesDownloadInitialState) => Array<WeiboImageItem>;
};

const sliceName: 'weiboImagesDownload' = 'weiboImagesDownload';
const { actions, reducer, selectors: selectorsObject }: Slice<
  WeiboImagesDownloadInitialState,
  SliceReducers,
  typeof sliceName,
  typeof sliceName,
  SliceSelectors
> = createSlice({
  name: sliceName,
  initialState: {
    cookie: '',
    accountId: '',
    sinceId: '0',
    list: []
  },
  reducers: {
    // 更新状态
    updateNextStatus(state: WeiboImagesDownloadInitialState, action: PayloadAction<UpdateNextStatusPayload>): void {
      state.cookie = action.payload.cookie;
      state.accountId = action.payload.accountId;
      state.sinceId = action.payload.sinceId;
    },

    // 更新列表
    setImagesList(state: WeiboImagesDownloadInitialState, action: PayloadAction<{ sinceId: string; list: Array<WeiboImageItem>; isInit?: boolean }>): void {
      if (action.payload.isInit) {
        state.list = action.payload.list;
      } else {
        state.list = state.list.concat(action.payload.list);
      }

      state.sinceId = action.payload.sinceId;
    },

    // 更新先选中
    setImageCheckedItem(state: WeiboImagesDownloadInitialState, action: PayloadAction<string>): void {
      const item: WeiboImageItem | undefined = state.list.find((o: WeiboImageItem): boolean => o.pid === action.payload);

      if (item) {
        item.checked = !item.checked;
        state.list = [...state.list];
      }
    },

    // 清空所有选中
    setClearAllChecked(state: WeiboImagesDownloadInitialState): void {
      state.list = state.list.map((o: WeiboImageItem): WeiboImageItem => {
        o.checked = false;

        return o;
      });
    }
  },
  selectors: {
    cookie: (state: WeiboImagesDownloadInitialState): string | undefined => state?.cookie,
    accountId: (state: WeiboImagesDownloadInitialState): string | undefined => state?.accountId,
    sinceId: (state: WeiboImagesDownloadInitialState): string | undefined => state?.sinceId,
    list: (state: WeiboImagesDownloadInitialState): Array<WeiboImageItem> => state?.list ?? []
  }
});

export const { updateNextStatus, setImagesList, setImageCheckedItem, setClearAllChecked }: CaseReducerActions<SliceReducers, typeof sliceName> = actions;
export { selectorsObject };
export default { [sliceName]: reducer };