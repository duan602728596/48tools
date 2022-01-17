import { initDatabase, type IDBEvent, type IndexItem } from '@indexeddb-tools/indexeddb';
import dbConfig, { type ObjectStoreItem } from './IDBConfig';

/* 初始化数据库 */
function IDBInit(): void {
  initDatabase(dbConfig.name, dbConfig.version, {
    upgradeneeded(event: IDBEvent & IDBVersionChangeEvent): void {
      const objectStore: Array<ObjectStoreItem> = dbConfig.objectStore;

      for (const item of objectStore) {
        const { name, key, data }: ObjectStoreItem = item;

        this.createObjectStore(name, key, data.map((o: string): IndexItem => ({ name: o, index: o })));
      }
    },
    success(event: IDBEvent): void {
      this.close();
    }
  });
}

export default IDBInit;