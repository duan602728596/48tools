import type { DanmuItem } from '../types';

type Listener = () => void;

/* 弹幕和视频 */
class DanmuStore {
  danmuList: Array<DanmuItem> = [];
  videoLoaded: boolean = false;
  listeners: Array<Listener> = [];

  getDanmuList: () => Array<DanmuItem> = (): Array<DanmuItem> => this.danmuList;

  getVideoLoaded: () => boolean = (): boolean => this.videoLoaded;

  subscribe: (listener: Listener) => Listener = (listener: Listener): Listener => {
    this.listeners.push(listener);

    return (): void => {
      this.listeners.splice(this.listeners.indexOf(listener), 1);
    };
  };

  emit(): void {
    this.listeners.forEach((listener: Listener): void => listener());
  }

  // 设置弹幕
  setDanmuList(d: Array<DanmuItem>): void {
    this.danmuList = d;
    this.emit();
  }

  // 设置视频加载状态
  setVideoLoaded(v: boolean): void {
    this.videoLoaded = v;
    this.emit();
  }
}

export const danmuStore: DanmuStore = new DanmuStore();