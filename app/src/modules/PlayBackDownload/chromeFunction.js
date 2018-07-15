/**
 * chrome下载事件
 * 事件的state说明
 *   0: 创建文件
 *   1: 开始下载
 *   2: 下载完成
 *   3: 取消下载
 * 当取消时状态在创建文件(0)时，从下载列表中删除
 * 当取消时状态在开始下载(1)时，不做任何操作
 */
import store from '../../store/store';
import { downloadList as downloadListAction } from './store/reducer';

/* 谷歌下载文件监听 */
export function handleChromeDownloadsChanged(infor: Object): void{
  const { id }: { id: number } = infor;
  const downloadList: Array = store.getState().get('playBackDownload').get('downloadList');

  /* 开始下载 */
  if('filename' in infor){
    const obj: Object = downloadList.get(id);
    obj.state = 1;
    obj.current = infor.filename.current;
    downloadList.set(id, obj);
  }

  /* 点击取消时 */
  if('error' in infor && infor.error.current === 'USER_CANCELED'){
    const obj: Object = downloadList.get(id);
    switch(obj.state){
      case 0:
        downloadList.delete(id);
        break;
      case 1:
        obj.state = 3;
        downloadList.set(id, obj);
        break;
    }
  }

  /* 下载完成 */
  if('endTime' in infor){
    const obj: Object = downloadList.get(id);
    obj.state = 2;
    downloadList.set(id, obj);
  }

  store.dispatch({
    type: downloadListAction.toString(),
    payload: {
      downloadList: new Map(Array.from(downloadList))
    }
  });
}
/* 谷歌下载创建文件监听 */
export function handleChromeDownloadsCreated(infor: Object): void{
  // 先将id和文件信息添加到Map结构内
  const downloadList: Map = store.getState().get('playBackDownload').get('downloadList');
  downloadList.set(infor.id, {
    infor,
    state: 0
  });
  // 更新store内的数据
  store.dispatch({
    type: downloadListAction.toString(),
    payload: {
      downloadList
    }
  });
}