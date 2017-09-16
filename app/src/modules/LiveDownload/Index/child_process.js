// @flow
import store from '../../../store/store';
import { downloadList } from '../store/reducer';

/* 子进程监听 */
export function child_process_stdout(data: any): void{
  // console.log(data.toString());
}

export function child_process_stderr(data: any): void{
  // console.log(data.toString());
}

export function child_process_exit(code: any, data: any): void{
  console.log('exit: ' + code + ' ' + data);
  child_process_cb();
}

export function child_process_error(err: any): void{
  console.error('error: \n' + err);
  child_process_cb();
}

// 子进程关闭
function child_process_cb(): void{
  const s: Object = store.getState().get('liveDownload').get('downloadList');
  store.dispatch({
    type: downloadList.toString(),
    payload: {
      downloadList: s.slice()
    }
  });
}