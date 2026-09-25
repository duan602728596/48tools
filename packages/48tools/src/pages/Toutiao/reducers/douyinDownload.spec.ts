jest.mock('../../../components/ProgressNative/index', (): { ProgressSet: typeof import('../../../components/ProgressNative/ProgressSet').default } => ({
  ProgressSet: jest.requireActual('../../../components/ProgressNative/ProgressSet').default
}));

import type { Reducer, UnknownAction } from '@reduxjs/toolkit';
import ProgressSet from '../../../components/ProgressNative/ProgressSet';
import type { DownloadItem } from '../types';
import {
  setAddDownloadList,
  setDeleteDownloadList,
  setDownloadProgress,
  setStartDownload
} from './douyinDownload';
import douyinDownloadReducers, { type DouyinDownloadInitialState } from './douyinDownload';

Object.defineProperty(globalThis, 'document', {
  configurable: true,
  value: { getElementById: (): null => null }
});

const reducer: Reducer<DouyinDownloadInitialState> = douyinDownloadReducers.douyinDownload;
const qid: string = 'douyin-download-104';
const downloadItem: DownloadItem = {
  qid,
  url: 'https://www.douyin.com/video/104',
  title: 'Issue 104',
  width: 1080,
  height: 1920,
  isImage: false
};

function initialState(): DouyinDownloadInitialState {
  return reducer(undefined, { type: 'test/initialize' } as UnknownAction);
}

function addDownloadItem(state: DouyinDownloadInitialState): DouyinDownloadInitialState {
  return reducer(state, setAddDownloadList(downloadItem));
}

function setProgress(state: DouyinDownloadInitialState, value: number): DouyinDownloadInitialState {
  return reducer(state, setDownloadProgress({ type: 'progress', qid, data: value }));
}

describe('Douyin download status', function(): void {
  test('should show waiting status before downloading', function(): void {
    const state: DouyinDownloadInitialState = addDownloadItem(initialState());

    expect(state.entities[qid]).toEqual(downloadItem);
    expect(state.downloadProgress[qid]).toBeUndefined();
    expect(state.downloadCompleted[qid]).toBeUndefined();
  });

  test('should keep progress while downloading', function(): void {
    const state: DouyinDownloadInitialState = setProgress(addDownloadItem(initialState()), 45);

    expect(state.downloadProgress[qid]).toBeInstanceOf(ProgressSet);
    expect(state.downloadProgress[qid].value).toBe(45);
    expect(state.downloadCompleted[qid]).toBeUndefined();
  });

  test('should mark the item completed after a successful download', function(): void {
    let state: DouyinDownloadInitialState = setProgress(addDownloadItem(initialState()), 100);

    state = reducer(state, setDownloadProgress({ type: 'success', qid, data: 100 }));

    expect(state.downloadProgress[qid]).toBeUndefined();
    expect(state.downloadCompleted[qid]).toBe(true);
  });

  test('should clear the completed status when downloading again', function(): void {
    let state: DouyinDownloadInitialState = addDownloadItem(initialState());

    state = reducer(state, setDownloadProgress({ type: 'success', qid, data: 100 }));
    state = reducer(state, setStartDownload(qid));

    expect(state.downloadCompleted[qid]).toBeUndefined();

    state = setProgress(state, 10);
    expect(state.downloadProgress[qid]).toBeInstanceOf(ProgressSet);
  });

  test('should clear progress and completed status when deleting an item', function(): void {
    let state: DouyinDownloadInitialState = addDownloadItem(initialState());

    state = reducer(state, setDownloadProgress({ type: 'success', qid, data: 100 }));
    state = setProgress(state, 10);
    state = reducer(state, setDeleteDownloadList(qid));

    expect(state.entities[qid]).toBeUndefined();
    expect(state.downloadProgress[qid]).toBeUndefined();
    expect(state.downloadCompleted[qid]).toBeUndefined();
  });
});
