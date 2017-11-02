import store from '../../../store/store';
import { catching } from '../store/index';

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
  const s: Object = store.getState().get('bilibili').get('index');
  const [m, ll]: [Map, Array] = [s.get('catching'), s.get('liveList')];

  m.forEach((value: Object, key: string): void=>{
    if(value.child.exitCode !== null || value.child.killed){
      m.delete(key);
    }
  });

  store.dispatch({
    type: catching.toString(),
    payload: {
      catching: m,
      liveList: ll.slice()
    }
  });
}