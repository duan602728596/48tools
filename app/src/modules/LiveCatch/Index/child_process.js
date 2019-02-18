import store from '../../../store/store';
import { liveChange } from '../store/index';
import post from '../../../components/post/post';

// 子进程关闭
async function child_process_cb(): Promise<void> {
  const s: Object = store.getState().get('liveCatch').get('index');
  const m: Map = s.get('liveCatch');

  m.forEach((value: Object, key: string): void => {
    if (value.child.exitCode !== null || value.child.killed) {
      m.delete(key);
    }
  });

  const data: string = await post(0);
  const data2: Object = JSON.parse(data);

  store.dispatch({
    type: liveChange.toString(),
    payload: {
      map: m,
      liveList: 'liveList' in data2.content ? data2.content.liveList : []
    }
  });
}

/* 子进程监听 */
export function child_process_stdout(data: any): void {
  // console.log(data.toString());
}

export function child_process_stderr(data: any): void {
  // console.log(data.toString());
}

export function child_process_exit(code: any, data: any): void {
  console.log('exit: ' + code + ' ' + data);
  child_process_cb();
}

export function child_process_error(err: any): void {
  console.error('error: \n' + err);
  child_process_cb();
}