import store from '../../../store/store';
import { inLiveList } from '../store/reducer';

// 子进程关闭
function child_process_cb() {
  const s = store.getState().get('inLive48').get('inLiveList').toJS();

  store.dispatch({
    type: inLiveList.toString(),
    payload: {
      inLiveList: s
    }
  });
}

/* 子进程监听 */
export function child_process_stdout(data) {
  // console.log(data.toString());
}

export function child_process_stderr(data) {
  // console.log(data.toString());
}

export function child_process_exit(code, data) {
  console.log('exit: ' + code + ' ' + data);
  child_process_cb();
}

export function child_process_error(err) {
  console.error('error: \n' + err);
  child_process_cb();
}