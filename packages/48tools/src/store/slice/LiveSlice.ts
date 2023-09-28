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

type LiveSliceEntityState = EntityState<WebWorkerChildItem, string>;

export interface LiveSliceInitialState extends LiveSliceEntityState {
  liveList: Array<LiveItem>;
  autoRecordTimer: NodeJS.Timeout | null;
}

type SliceReducers = {
  setAddWorkerItem: CaseReducer<LiveSliceInitialState, PayloadAction<WebWorkerChildItem>>;
  setRemoveWorkerItem: CaseReducer<LiveSliceInitialState, PayloadAction<string>>;
  setLiveListFromDB: CaseReducer<LiveSliceInitialState, PayloadAction<{ result: Array<LiveItem> }>>;
  setAddLiveItemFromDB: CaseReducer<LiveSliceInitialState, PayloadAction<{ data: LiveItem }>>;
  setLiveItemAutoRecordDB: CaseReducer<LiveSliceInitialState, PayloadAction<{ data: LiveItem }>>;
  setDeleteLiveItemFromDB: CaseReducer<LiveSliceInitialState, PayloadAction<{ query: string }>>;
  setAutoRecordTimer: CaseReducer<LiveSliceInitialState, PayloadAction<NodeJS.Timeout | null>>;
};

type SliceSelectors<SliceName extends string> = {
  workerList: (this: LiveSlice<SliceName>, state: LiveSliceInitialState) => Array<WebWorkerChildItem>;
  liveList: (this: LiveSlice<SliceName>, state: LiveSliceInitialState) => Array<LiveItem>;
  autoRecordTimer: (this: LiveSlice<SliceName>, state: LiveSliceInitialState) => NodeJS.Timeout | null;
};

export type LiveSliceSelector = Pick<LiveSliceInitialState, 'liveList' | 'autoRecordTimer'> & {
  workerList: Array<WebWorkerChildItem>;
};
export type LiveSliceSelectorNoAutoRecordTimer = Omit<LiveSliceSelector, 'autoRecordTimer'>;

/* 创建一个通用的redux slice，支持直播的房间的添加删除在数据库中，以及worker的添加和删除 */
export class LiveSlice<SliceName extends string> {
  public sliceName: SliceName;
  public objectStoreName: string;

  public adapter: EntityAdapter<WebWorkerChildItem, string>;
  public selectors: EntitySelectors<WebWorkerChildItem, LiveSliceEntityState, string>;
  public initialState: LiveSliceInitialState;
  public ignoredPaths: Array<string>;
  public ignoredActions: Array<string>;

  public setAddWorkerItem: SliceReducers['setAddWorkerItem'];
  public setRemoveWorkerItem: SliceReducers['setRemoveWorkerItem'];

  public IDBCursorLiveList: CursorDispatchFunc;
  public IDBSaveLiveItem: DataDispatchFunc;
  public IDBSaveAutoRecordLiveItem: DataDispatchFunc;
  public IDBDeleteLiveItem: QueryDispatchFunc;

  public slice: Slice<LiveSliceInitialState, SliceReducers, SliceName, SliceName, SliceSelectors<SliceName>>;

  constructor(sliceName: SliceName, objectStoreName: string) {
    this.sliceName = sliceName;
    this.objectStoreName = objectStoreName;

    this.adapter = createEntityAdapter({
      selectId: (item: WebWorkerChildItem): string => item.id
    });
    this.selectors = this.adapter.getSelectors();
    this.initialState = this.adapter.getInitialState({
      liveList: [],
      autoRecordTimer: null
    });
    this.ignoredPaths = [
      `${ this.sliceName }.entities`,
      `${ this.sliceName }.autoRecordTimer`
    ];
    this.ignoredActions = [
      `${ this.sliceName }/setAddWorkerItem`,
      `${ this.sliceName }/setRemoveWorkerItem`,
      `${ this.sliceName }/setAutoRecordTimer`
    ];

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
        setLiveItemAutoRecordDB: this.setLiveItemAutoRecordDB,
        setDeleteLiveItemFromDB: this.setDeleteLiveItemFromDB,
        setAutoRecordTimer: this.setAutoRecordTimer
      },
      selectors: {
        // worker list Selector
        workerList: (state: LiveSliceInitialState): Array<WebWorkerChildItem> => this.selectors.selectAll(state),

        // live list Selector
        liveList: (state: LiveSliceInitialState): Array<LiveItem> => state.liveList,

        // auto record timer Selector
        autoRecordTimer: (state: LiveSliceInitialState): NodeJS.Timeout | null => state.autoRecordTimer
      }
    });
    this.IDBInit();
  }

  // 数据库的创建
  IDBInit(): void {
    const {
      setLiveListFromDB,
      setAddLiveItemFromDB,
      setLiveItemAutoRecordDB,
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
    this.IDBSaveAutoRecordLiveItem = IDBRedux.putAction({
      objectStoreName: this.objectStoreName,
      successAction: setLiveItemAutoRecordDB
    });
    this.IDBDeleteLiveItem = IDBRedux.deleteAction({
      objectStoreName: this.objectStoreName,
      successAction: setDeleteLiveItemFromDB
    });
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

  // 更新数据
  setLiveItemAutoRecordDB: SliceReducers['setLiveItemAutoRecordDB']
    = (state: LiveSliceInitialState, action: PayloadAction<{ data: LiveItem }>): void => {
      const index: number = state.liveList.findIndex((o: LiveItem): boolean => o.id === action.payload.data.id);

      if (index >= 0) {
        const nextLiveList: Array<LiveItem> = [...state.liveList];

        nextLiveList[index].autoRecord = action.payload.data.autoRecord;
        state.liveList = nextLiveList;
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

  // 设置自动直播
  setAutoRecordTimer: SliceReducers['setAutoRecordTimer']
    = (state: LiveSliceInitialState, action: PayloadAction<NodeJS.Timeout | null>): void => {
      state.autoRecordTimer = action.payload;
    };

  get _workerList(): Array<WebWorkerChildItem> {
    return this.selectors.selectAll(this.initialState);
  }
}