import IndexedDBRedux from 'indexeddb-tools-redux';
import dbConfig from './dbConfig';

/* indexeddb redux */
const db: IndexedDBRedux = new IndexedDBRedux(dbConfig.name, dbConfig.version);

export const bilibiliLiveObjectStoreName: string = dbConfig.objectStore[0].name;
export const acfunLiveObjectStoreName: string = dbConfig.objectStore[1].name;
export const optionsObjectStoreName: string = dbConfig.objectStore[2].name;
export default db;