import { IDBReduxInstance, type IndexedDBRedux } from '@indexeddb-tools/indexeddb-redux';
import dbConfig, { objectStoreMaps } from './IDBConfig';

/* indexeddb redux */
const IDBRedux: IndexedDBRedux = IDBReduxInstance(dbConfig.name, dbConfig.version);

export const bilibiliLiveObjectStoreName: string = objectStoreMaps.bilibiliLive.name;
export const acfunLiveObjectStoreName: string = objectStoreMaps.acfunLive.name;
export const optionsObjectStoreName: string = objectStoreMaps.options.name;
export const weiboLoginListObjectStoreName: string = objectStoreMaps.weiboLoginList.name;
export const ffmpegTemplateObjectStore: string = objectStoreMaps.ffmpegTemplate.name;
export const pocket48RoomVoiceObjectStoreName: string = objectStoreMaps.pocket48RoomVoice.name;
export const douyinLiveObjectStoreName: string = objectStoreMaps.douyinLive.name;
export const kuaishouLiveObjectStoreName: string = objectStoreMaps.kuaishouLive.name;
export const pocket48UserInfoObjectStoreName: string = objectStoreMaps.pocket48UserInfo.name;
export default IDBRedux;