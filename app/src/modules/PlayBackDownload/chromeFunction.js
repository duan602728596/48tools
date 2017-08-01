/**
 * chrome下载事件
 * 事件的state说明
 *   0: 创建文件
 *   1: 开始下载
 *   2: 下载完成
 *   3: 取消
 * 当取消时状态在创建文件(0)时，从下载列表中删除
 * 当取消时状态在开始下载(1)时，不做任何操作
 */

// 谷歌下载文件监听
export function onChromeDownloadsChanged(infor){
  const { id } = infor;
  const { downloadList } = this.props;

  /* 开始下载 */
  if('filename' in infor){
    const obj = downloadList.get(id);
    obj.state = 1;
    downloadList.set(obj);
  }

  /* 点击取消时 */
  if('error' in infor && infor.error.current === 'USER_CANCELED'){
    const obj = downloadList.get(id);
    switch(obj.state){
      case 0:
        downloadList.delete(id);
        break;
      case 1:
        obj.state = 2;
        downloadList.set(id, obj);
        break;
    }
  }

  /* 下载完成 */
  if('endTime' in infor){
    const obj = downloadList.get(id);
    obj.state = 2;
    downloadList.set(id, obj);
  }

  this.props.action.downloadList({
    downloadList: downloadList
  });
}
// 谷歌下载创建文件监听
export function onChromeDownloadsCreated(infor){
  // 先将id和文件信息添加到Map结构内
  this.props.downloadList.set(infor.id, {
    infor,
    state: 0
  });
  // 更新store内的数据
  this.props.action.downloadList({
    downloadList: this.props.downloadList
  });
}