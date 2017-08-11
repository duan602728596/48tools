import IndexedDB from 'indexeddb-tools';
import option from './option';

/* 初始化所有的数据库 */
IndexedDB(option.indexeddb.name, option.indexeddb.version, {
  success: function(et, event){
    this.close();
  },
  upgradeneeded: function(et, event){
    { // 存储的是直播抓取页面的自动录制配置
      const { name, key, data } = option.indexeddb.objectStore.liveCatch;
      if(!this.hasObjectStore(name)){
        this.createObjectStore(name, key, data)
      }
    }
    { // 储存B站直播间信息
      const { name, key, data } = option.indexeddb.objectStore.bilibili;
      if(!this.hasObjectStore(name)){
        this.createObjectStore(name, key, data)
      }
    }
    this.close();
  }
});