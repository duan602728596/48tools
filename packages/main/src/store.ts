import * as ElectronStore from 'electron-store';
import type { ThemeValue } from './ipcListener/themeChange';

/* 本地存储 */
interface StoreRecord {
  theme: ThemeValue;
}

type Store = ElectronStore<StoreRecord>;

let store: Store;

/* 初始化store */
export function storeInit(): void {
  store = new ElectronStore<StoreRecord>({
    schema: {
      theme: {
        type: 'string',
        enum: ['system', 'light', 'dark']
      }
    }
  });
}

/* 获取store */
export function getStore(): Store {
  return store;
}