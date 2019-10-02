import { List } from 'immutable';
import store from '../../../store/store';
import { catching } from '../reducer/index';

// 子进程关闭
function child_process_cb() {
  const s = store.getState().get('bilibili').get('index');
  const [m, ll] = [s.get('catching'), s.get('liveList').toJS()];

  m.forEach((value, key) => {
    if (value.child.exitCode !== null || value.child.killed) {
      m.delete(key);
    }
  });

  store.dispatch({
    type: catching.toString(),
    payload: {
      catching: m,
      liveList: List(ll)
    }
  });
}

/* 子进程监听 */
export function child_process_stdout(data) {
  console.log(data.toString());
}

export function child_process_stderr(data) {
  console.log(data.toString());
}

export function child_process_exit(code, data) {
  console.log('exit: ' + code + ' ' + data);
  child_process_cb();
}

export function child_process_error(err) {
  console.error('error: \n' + err);
  child_process_cb();
}