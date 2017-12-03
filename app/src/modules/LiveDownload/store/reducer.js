import { createAction, handleActions, combineActions } from 'redux-actions';
import { fromJS } from 'immutable';
import { objectToArray } from '../../../function';
import indexReducer, * as indexAction from './index';

/* 使用immutable初始化基础数据 */
const initData: {
  index: Object,
  downloadList: Array
} = {
  index: {},
  downloadList: []
};

/* Action */
export const downloadList = createAction('公演下载列表');

/* reducer */
const reducer: Function = handleActions({
  [combineActions(...objectToArray(indexAction))]: ($$state: Immutable.Map, action: Object): Immutable.Map=>{
    return $$state.set('index', indexReducer($$state.get('index'), action));
  },
  [downloadList]: ($$state: Immutable.Map, action: Object): Immutable.Map=>{
    return $$state.set('downloadList', action.payload.downloadList);
  }
}, fromJS(initData));

export default {
  liveDownload: reducer
};