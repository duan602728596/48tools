import IndexedDB from 'indexeddb-tools';
import dbConfig, { ObjectStoreItem } from './dbConfig';

interface IndexArrayItem {
  name: string;
  index: string;
}

/* 初始化数据库 */
function dbInit(): void {
  // 初始化数据库
  function handleDbUpgradeneeded(event: IDBVersionChangeEvent): void {
    const objectStore: Array<ObjectStoreItem> = dbConfig.objectStore;

    for (let i: number = 0, j: number = objectStore.length; i < j; i++) {
      const { name, key, data }: ObjectStoreItem = objectStore[i];

      if (!this.hasObjectStore(name)) {
        const indexArray: Array<IndexArrayItem> = data.map((item: string, index: number): IndexArrayItem => ({
          name: item, index: item
        }));

        this.createObjectStore(name, key, indexArray);
      }
    }
    this.close();
  }

  // 数据库打开成功
  function handleDbOpenSuccess(event: Event): void {
    this.close();
  }

  IndexedDB(dbConfig.name, dbConfig.version, {
    upgradeneeded: handleDbUpgradeneeded,
    success: handleDbOpenSuccess
  });
}

export default dbInit;