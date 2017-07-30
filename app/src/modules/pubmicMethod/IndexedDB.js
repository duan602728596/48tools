((factory)=>{

  if(typeof module === "object" && typeof module.exports === 'object'){
    module.exports = factory(window);
  }else{
    window.IndexedDB = factory(window);
  }

})((_window)=>{
  /**
   * 获取IDBKeyRange
   * 根据字符串返回游标查询的范围，例如：
   * '5'      等于
   * '>  5'   大于
   * '>= 5'   大于等于
   * '<  5'   小于
   * '<= 5'   小于等于
   * '[5, 8]' 闭区间
   * '(5, 8)' 开区间
   * @param {String} range: 传递字符串
   * @return
   */
  function getRange(range) {
    let result = null;

    if(typeof range === 'number'){
      result = range;
    }else if(typeof range === 'string'){
      // 对字符串进行判断

      // 大于
      if(/^\s*>\s*(-?\d+(\.\d+)?)\s*$/i.test(range)) {
        result = IDBKeyRange.lowerBound(Number(range.match(/(-?\d+(\.\d+)?)/g)[0]), true);
      }

      // 大于等于
      else if(/^\s*>\s*=\s*(-?\d+(\.\d+)?)\s*$/i.test(range)) {
        result = IDBKeyRange.lowerBound(Number(range.match(/(-?\d+(\.\d+)?)/g)[0]));
      }

      // 小于
      else if(/^\s*<\s*(-?\d+(\.\d+)?)\s*$/i.test(range)) {
        result = IDBKeyRange.upperBound(Number(range.match(/(-?\d+(\.\d+)?)/g)[0]), true);
      }

      // 小于等于
      else if(/^\s*<\s*=\s*(-?\d+(\.\d+)?)\s*$/i.test(range)) {
        result = IDBKeyRange.upperBound(Number(range.match(/(-?\d+(\.\d+)?)/g)[0]));
      }

      // 判断区间
      else if(/^\s*[\[\(]\s*(-?\d+(\.\d+)?)\s*\,\s*(-?\d+(\.\d+)?)\s*[\]\)]\s*$/i.test(range)){
        const [v0, v1] = range.match(/(-?\d+(\.\d+)?)/g);
        let [isOpen0, isOpen1] = [false, false];

        // 判断左右开区间和闭区间

        if(/^.*\(.*$/.test(range)){
          isOpen0 = true;
        }

        if(/^.*\).*$/.test(range)){
          isOpen1 = true;
        }

        result = IDBKeyRange.bound(Number(v0), Number(v1), isOpen0, isOpen1);
      }

      else{
        result = range;
      }
    }

    return result;
  }

  /**
   * IndexedDB
   * @param {String} name          : 创建或者连接的数据库名
   * @param {Number} version       : 数据库版本号
   * @param {Object} callbackObject: 配置回调函数
   * callbackObject用来配置创建或者连接数据库的回调函数
   * success：创建或者连接的数据库成功后的回调函数
   * error：创建或者连接的数据库失败后的回调函数
   * upgradeneeded：数据库版本号更新后的回调函数
   */

  function IndexedDB(name, version, callbackObject = {}){

    IndexedDB.prototype.indexeddb = IndexedDB.indexeddb;
    IndexedDB.prototype.Init.prototype = IndexedDB.prototype;

    // 返回实例
    return new IndexedDB.prototype.Init(name, version, callbackObject);
  }

  IndexedDB._funIng = false; // 是否有事件执行

    /* 兼容不同浏览器 */
  IndexedDB.indexeddb = _window.indexedDB
                     || _window.webkitIndexedDB
                     || _window.mozIndexedDB
                     || _window.msIndexedDB;

  /**
   * 删除数据库
   * @param {String} databaseName: 数据库名
   */
  IndexedDB.deleteDatabase = function(databaseName){
    IndexedDB.indexeddb.deleteDatabase(databaseName);
    console.log('删除数据库：' + databaseName + '。');
  };

    /* IndexedDB.prototype.Init */

  /**
   * 初始化
   * @param {String} name          : 创建或者连接的数据库名
   * @param {Number} version       : 数据库版本号
   * @param {Object} callbackObject: 配置回调函数
   */
  IndexedDB.prototype.Init = function (name, version, callbackObject){

    // 数据库的名字、版本，回调函数、表
    this.name = name;
    this.version = version;
    this.callbackObject = callbackObject;
    this.db = null;

    // 创建或者打开数据库
    this.request = this.indexeddb.open(name, version);


    // 打开数据库成功
    this._requestSuccess = function(event){
      console.log('打开数据库成功！');
      if(this.callbackObject.success){
        this.db = event.target.result;
        this.callbackObject.success.call(this, event.target);
      }
    };

    // 打开数据库失败
    this._requestError = function(event){
      console.log('打开数据库失败！');
      if(this.callbackObject.error){
        console.log(event.target.error.message);
        this.callbackObject.error.call(this, event.target.error);
      }
    };

    // 更新数据库版本
    this._requestUpgradeneeded = function(event){
      console.log('数据库版本更新！');
      if(this.callbackObject.upgradeneeded){
        this.db = event.target.result;
        this.callbackObject.upgradeneeded.call(this, event.target);
      }
    };

    /**
     * xx秒后关闭数据库
     * @param {Number} time: 延迟关闭的时间
     */
    this.close = function(time = 100){
      const close = ()=>{
        if(IndexedDB._funIng === true){
          this.db.close();
          console.log('数据库关闭。');
        }else{
          setTimeout(close, time);
        }
      };
      setTimeout(close, time);
    };

    /**
     * 判断是否有ObjectStore
     * @param {String} objectStoreName: ObjectStore名字
     * @return {Boolean}
     */
    this.hasObjectStore = function(objectStoreName){
      return this.db.objectStoreNames.contains(objectStoreName);
    };

    /**
     * 创建ObjectStore
     * @param {String} objectStoreName: ObjectStore名字
     * @param {String} keyPath        : ObjectStore关键字
     * @param {Array} indexArray      : 添加索引和键值，name -> 索引， age -> 键值
     */
    this.createObjectStore = function(objectStoreName, keyPath, indexArray){
      if(!this.hasObjectStore(objectStoreName)){
        const store = this.db.createObjectStore(objectStoreName, {
          keyPath: keyPath
        });

        if(indexArray){
          for(let i = 0, j = indexArray.length; i < j; i++){
            store.createIndex(
              indexArray[i].name,   // 索引
              indexArray[i].index,  // 键值
              {                     // 索引是否唯一
                unique: indexArray[i].unique ? indexArray[i].unique : false
              });
          }
        }

        console.log('创建了新的ObjectStore：' + objectStoreName + '。');
      }else{
        console.log('ObjectStore：' + objectStoreName + '已存在。');
      }
      return this;
    };

    /**
     * 删除ObjectStore
     * @param {String} objectStoreName: ObjectStore名字
     */

    this.deleteObjectStore = function(objectStoreName){
      if(!this.hasObjectStore(objectStoreName)){
        this.db.deleteObjectStore(objectStoreName);
        console.log('删除了新的ObjectStore：' + objectStoreName + '。');
      }else{
        console.log('ObjectStore：' + objectStoreName + '不存在。');
      }
      return this;
    };

    /**
     * 获取操作ObjectStore
     * @param {String} objectStoreName: ObjectStore名字
     * @param {Boolean} writeAble     : 只读还是读写
     */
    this.getObjectStore = function(objectStoreName, writeAble = true){
      return new ObjectStore(this.db, objectStoreName, writeAble);
    };

    // 绑定函数
    this.request.addEventListener('success', this._requestSuccess.bind(this), false);
    this.request.addEventListener('error', this._requestError.bind(this), false);
    this.request.addEventListener('upgradeneeded', this._requestUpgradeneeded.bind(this), false);

    // 返回
    return this;

  };


    /* objectsSore */

    /* 初始化 */
  function ObjectStore(db, objectStoreName, writeAble){

    this.db = db;

    const wa = writeAble === true ? 'readwrite' : 'readonly';
    const transaction = this.db.transaction(objectStoreName, wa);

    this.store = transaction.objectStore(objectStoreName);

    return this;
  }

  /**
   * 添加数据
   * @param {Object | Array} obj: 数组添加多个数据，object添加单个数据
   */
  ObjectStore.prototype.add = function(obj){
    IndexedDB._funIng = true;
    obj = obj instanceof Array ? obj : [obj];
    for(let i = 0, j = obj.length - 1; i <= j; i++){
      this.store.add(obj[i]);
      if(i === j){
        console.log('数据添加成功');
        IndexedDB._funIng = false;
      }
    }
    return this;
  };

  /**
   * 更新数据
   * @param {Object | Array} obj: 数组添加多个数据，object添加单个数据
   */
  ObjectStore.prototype.put = function(obj){
    IndexedDB._funIng = true;
    obj = obj instanceof Array ? obj : [obj];
    for(let i = 0, j = obj.length - 1; i <= j; i++){
      this.store.put(obj[i]);
      if(i === j){
        console.log('数据更新成功');
        IndexedDB._funIng = false;
      }
    }
    return this;
  };

  /**
   * 删除数据
   * @param {String | Number | Array} value: 数组添加多个数据，object添加单个数据
   */
  ObjectStore.prototype.delete = function(value){
    IndexedDB._funIng = true;
    value = value instanceof Array ? value : [value];
    for(let i = 0, j = value.length - 1; i <= j; i++){
      this.store.delete(value[i]);
      if(i === j){
        console.log('数据删除成功');
        IndexedDB._funIng = false;
      }
    }
    return this;
  };

    /* 清除数据 */
  ObjectStore.prototype.clear = function(value){
    this.store.clear();
    console.log('数据清除成功');
    return this;
  };

  /**
   * 获取数据
   * @param {String | Number} value: 键值
   * @param {Function} callback    : 获取成功的回调函数
   */
  ObjectStore.prototype.get = function(value, callback){
    const g = this.store.get(value);

    function success(event){
      if(callback){
        callback.call(this, event.target.result, event.target);
      }
    }

    g.addEventListener('success', success.bind(this), false);

    return this;
  };

  /**
   * 游标
   * @param {String} indexName               : 索引名
   * @param {String | Number | Boolean} range: 查询范围：有等于，大于等于，小于，小于等于，区间
   * @param {Function} callback              : 查询成功的回调函数
   *
   * result.value
   * result.continue()
   */
  ObjectStore.prototype.cursor = function(indexName /*, range, callback */){

    const callback = typeof arguments[1] === 'function' ? arguments[1] : arguments[2];

    const index = this.store.index(indexName);
    const range = arguments[2] ? getRange(arguments[1]) : null;
    const cursor = range === null ? index.openCursor() : index.openCursor(range);


    function success(event){
      if(callback){
        callback.call(this, event.target.result, event.target);
      }
    }

    cursor.addEventListener('success', success.bind(this), false);

    return this;
  };

  return IndexedDB;
});

