import { observable, makeAutoObservable } from 'mobx';
import { findIndex } from 'lodash';
import type { LiveInfo } from '../interface';

export interface LiveChildItem {
  id: string;
  worker: Worker;
}

/* 口袋48直播和录播 */
class L48 {
  public liveList: Array<LiveInfo> = [];             // 直播信息
  public liveChildList: Array<LiveChildItem> = [];   // 直播下载队列
  public recordList: Array<LiveInfo> = [];           // 录播信息
  public recordNext: string = '0';                   // 记录录播分页位置
  public recordChildList: Array<LiveChildItem> = []; // 录播下载队列

  constructor() {
    makeAutoObservable(this);
  }

  // 设置直播信息
  setLiveList(payload: Array<LiveInfo>): void {
    this.liveList = payload;
  }

  // 直播下载队列添加一个新队列
  setAddLiveChildList(payload: LiveChildItem): void {
    this.liveChildList.push(payload);
  }

  // 直播下载队列删除一个新队列
  setDeleteLiveChildList(payload: LiveInfo): void {
    const index: number = findIndex(this.liveChildList, { id: payload.liveId });

    if (index >= 0) {
      this.liveChildList.splice(index, 1);
    }
  }
}

const l48Store: L48 = new L48();

export default l48Store;