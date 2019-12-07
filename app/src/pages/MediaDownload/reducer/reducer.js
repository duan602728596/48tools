import { handleActions, createAction } from 'redux-actions';
import { fromJS, List, Map } from 'immutable';

const initData = {
  mediaDownloadList: [], // 下载列表
  downloading: [],       // 正在下载
  logs: {}               // 日志
};

/* Action */
export const setDownloadList = createAction('mediaDownload/视频、音频下载列表');
export const setDownloading = createAction('mediaDownload/正在下载');
export const setLogs = createAction('mediaDownload/日志');

/* reducer */
const reducer = handleActions({
  [setDownloadList]($$state, action) {
    return $$state.set('mediaDownloadList', List(action.payload));
  },

  [setDownloading]($$state, action) {
    return $$state.set('downloading', List(action.payload));
  },

  [setLogs]($$state, action) {
    return $$state.set('logs', Map(action.payload));
  }
}, fromJS(initData));

export default {
  mediaDownload: reducer
};