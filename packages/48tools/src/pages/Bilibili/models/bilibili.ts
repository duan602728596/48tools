import { makeAutoObservable, runInAction } from 'mobx';
import IndexedDB from 'indexeddb-tools';
import { findIndex } from 'lodash';
import dbConfig from '../../../utils/idb/dbConfig';
import type { DownloadItem, LiveItem } from '../types';

export interface LiveChildItem {
  id: string;
  worker: Worker;
}

class Bilibili {
  public bilibiliLiveList: Array<LiveItem> = [];           // 数据库内获取的直播间列表
  public liveChildList: Array<LiveChildItem> = [];         // 直播下载
  public downloadList: Array<DownloadItem> = [];           // 下载列表
  public downloadProgress: { [key: string]: number } = {}; // 下载进度条

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true });
  }

  // 请求所有列表
  dbQueryAllLiveList(): void {
    const self: this = this;

    function handleDBSuccess(event: IDBOpenDBRequestEventMap): void {
      if (!this.hasObjectStore(dbConfig.objectStore[0].name)) return;

      const self1: any = this;
      const store: any = this.getObjectStore(dbConfig.objectStore[0].name, true);
      const resultArr: Array<LiveItem> = [];

      store.cursor(dbConfig.objectStore[0].data[0], function(event1: IDBOpenDBRequestEventMap): void {
        const result: IDBCursor = event1['target'].result;

        if (result) {
          resultArr.push(result['value']);
          result.continue();
        } else {
          runInAction(function(): void {
            self.bilibiliLiveList = resultArr;
          });
          self1.close();
        }
      });
    }

    IndexedDB(dbConfig.name, dbConfig.version, { success: handleDBSuccess });
  }

  // 添加一个数据
  dbPutLiveListData(payload: LiveItem): void {
    const self: this = this;

    function handleDBSuccess(event: IDBOpenDBRequestEventMap): void {
      if (!this.hasObjectStore(dbConfig.objectStore[0].name)) return;

      const store: any = this.getObjectStore(dbConfig.objectStore[0].name, true);

      store.put(payload);
      runInAction(function(): void {
        self.bilibiliLiveList = self.bilibiliLiveList.concat([payload]);
      });
    }

    IndexedDB(dbConfig.name, dbConfig.version, { success: handleDBSuccess });
  }

  // 删除一个数据
  dbDeleteLiveListData(payload: LiveItem): void {
    const self: this = this;

    function handleDBSuccess(event: IDBOpenDBRequestEventMap): void {
      if (!this.hasObjectStore(dbConfig.objectStore[0].name)) return;

      const store: any = this.getObjectStore(dbConfig.objectStore[0].name, true);

      store.delete(payload.id);

      const index: number = findIndex(self.bilibiliLiveList, { id: payload.id });

      if (index >= 0) {
        runInAction(function(): void {
          self.bilibiliLiveList.splice(index, 1);
          self.bilibiliLiveList = [...self.bilibiliLiveList];
        });
      }
    }

    IndexedDB(dbConfig.name, dbConfig.version, { success: handleDBSuccess });
  }

  // 直播下载队列添加一个新队列
  setAddLiveChildList(payload: LiveChildItem): void {
    this.liveChildList.push(payload);
  }

  // 直播下载队列删除一个新队列
  setDeleteLiveChildList(payload: LiveItem): void {
    const index: number = findIndex(this.liveChildList, { id: payload.id });

    if (index >= 0) {
      this.liveChildList.splice(index, 1);
    }
  }

  // 添加下载列表
  setAddDownloadList(payload: DownloadItem): void {
    this.downloadList = this.downloadList.concat([payload]);
  }

  // 删除下载任务
  setDeleteDownloadListTask(payload: DownloadItem): void {
    const index: number = findIndex(this.downloadList, { qid: payload.qid });

    if (index >= 0) {
      this.downloadList.splice(index, 1);
      this.downloadList = [...this.downloadList];
    }
  }

  // 设置下载进度
  setDownloadProgress(qid: string, data: number, isDelete?: boolean): void {
    if (isDelete) {
      delete this.downloadProgress[qid];
    } else {
      this.downloadProgress[qid] = data;
    }
  }
}

const bilibiliStore: Bilibili = new Bilibili();

export default bilibiliStore;