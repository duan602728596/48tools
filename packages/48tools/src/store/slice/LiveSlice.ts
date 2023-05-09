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
import IDBRedux from '../../utils/IDB/IDBRedux';
import type { DataDispatchFunc, CursorDispatchFunc, QueryDispatchFunc } from '@indexeddb-tools/indexeddb-redux';
import type { WebWorkerChildItem, LiveItem } from '../../commonTypes';

export interface LiveSliceInitialState extends EntityState<WebWorkerChildItem> {
  liveList: Array<LiveItem>;
}

type SliceReducers = {
  setAddWorkerItem: CaseReducer<LiveSliceInitialState, PayloadAction<WebWorkerChildItem>>;
  setRemoveWorkerItem: CaseReducer<LiveSliceInitialState, PayloadAction<string>>;
  setLiveListFromDB: CaseReducer<LiveSliceInitialState, PayloadAction<{ result: Array<LiveItem> }>>;
  setAddLiveItemFromDB: CaseReducer<LiveSliceInitialState, PayloadAction<{ data: LiveItem }>>;
  setDeleteLiveItemFromDB: CaseReducer<LiveSliceInitialState, PayloadAction<{ query: string }>>;
};

export type LiveSliceSelector = Pick<LiveSliceInitialState, 'liveList'> & {
  workerList: Array<WebWorkerChildItem>;
};

type WorkerListSelector<SliceName extends string> = (this: LiveSlice<SliceName>, initialState: any) => Array<WebWorkerChildItem>;
type LiveListSelector<SliceName extends string> = (this: LiveSlice<SliceName>, initialState: any) => Array<LiveItem>

/* 创建一个通用的redux slice，支持直播的房间的添加删除在数据库中，以及worker的添加和删除 */
export class LiveSlice<SliceName extends string> {
  public sliceName: SliceName;
  public objectStoreName: string;

  public adapter: EntityAdapter<WebWorkerChildItem>;
  public selectors: EntitySelectors<WebWorkerChildItem, EntityState<WebWorkerChildItem>>;
  public initialState: LiveSliceInitialState;
  public ignoredPaths: Array<string>;
  public ignoredActions: Array<string>;

  public setAddWorkerItem: SliceReducers['setAddWorkerItem'];
  public setRemoveWorkerItem: SliceReducers['setRemoveWorkerItem'];

  public IDBCursorLiveList: CursorDispatchFunc;
  public IDBSaveLiveItem: DataDispatchFunc;
  public IDBDeleteLiveItem: QueryDispatchFunc;

  public slice: Slice<LiveSliceInitialState, SliceReducers, SliceName>;

  constructor(sliceName: SliceName, objectStoreName: string) {
    this.sliceName = sliceName;
    this.objectStoreName = objectStoreName;

    this.adapter = createEntityAdapter({
      selectId: (item: WebWorkerChildItem): string => item.id
    });
    this.selectors = this.adapter.getSelectors();
    this.initialState = this.adapter.getInitialState({ liveList: [] });
    this.ignoredPaths = [`${ this.sliceName }.entities`];
    this.ignoredActions = [`${ this.sliceName }/setAddWorkerItem`, `${ this.sliceName }/setRemoveWorkerItem`];

    this.setAddWorkerItem = this.adapter.addOne;
    this.setRemoveWorkerItem = this.adapter.removeOne;

    this.slice = createSlice({
      name: this.sliceName,
      initialState: this.initialState,
      reducers: {
        setAddWorkerItem: this.setAddWorkerItem,
        setRemoveWorkerItem: this.setRemoveWorkerItem,
        setLiveListFromDB: this.setLiveListFromDB,
        setAddLiveItemFromDB: this.setAddLiveItemFromDB,
        setDeleteLiveItemFromDB: this.setDeleteLiveItemFromDB
      }
    });
    this.IDBInit();
  }

  get selectorObject(): { workerList: WorkerListSelector<SliceName>; liveList: LiveListSelector<SliceName> } {
    return {
      workerList: this.workerListSelector,
      liveList: this.liveListSelector
    };
  }

  // 从数据库内查数据
  setLiveListFromDB: SliceReducers['setLiveListFromDB']
    = (state: LiveSliceInitialState, action: PayloadAction<{ result: Array<LiveItem> }>): void => {
      state.liveList = action.payload.result;
    };

  // 添加数据
  setAddLiveItemFromDB: SliceReducers['setAddLiveItemFromDB']
    = (state: LiveSliceInitialState, action: PayloadAction<{ data: LiveItem }>): void => {
      const index: number = state.liveList.findIndex((o: LiveItem): boolean => o.id === action.payload.data.id);

      if (index < 0) {
        state.liveList = state.liveList.concat([action.payload.data]);
      }
    };

  // 删除数据
  setDeleteLiveItemFromDB: SliceReducers['setDeleteLiveItemFromDB']
    = (state: LiveSliceInitialState, action: PayloadAction<{ query: string }>): void => {
      const index: number = state.liveList.findIndex((o: LiveItem): boolean => o.id === action.payload.query);

      if (index >= 0) {
        const nextLiveList: Array<LiveItem> = [...state.liveList];

        nextLiveList.splice(index, 1);
        state.liveList = nextLiveList;
      }
    };

  // 数据库的创建
  IDBInit(): void {
    const {
      setLiveListFromDB,
      setAddLiveItemFromDB,
      setDeleteLiveItemFromDB
    }: CaseReducerActions<SliceReducers, SliceName> = this.slice.actions;

    this.IDBCursorLiveList = IDBRedux.cursorAction({
      objectStoreName: this.objectStoreName,
      successAction: setLiveListFromDB
    });
    this.IDBSaveLiveItem = IDBRedux.putAction({
      objectStoreName: this.objectStoreName,
      successAction: setAddLiveItemFromDB
    });
    this.IDBDeleteLiveItem = IDBRedux.deleteAction({
      objectStoreName: this.objectStoreName,
      successAction: setDeleteLiveItemFromDB
    });
  }

  // worker list Selector
  workerListSelector: WorkerListSelector<SliceName>
    = (initialState: any): Array<WebWorkerChildItem> => this.selectors.selectAll(initialState[this.sliceName]);

  // live list Selector
  liveListSelector: LiveListSelector<SliceName>
    = (initialState: any): Array<LiveItem> => initialState[this.sliceName].liveList;
}