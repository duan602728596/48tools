import { handleActions, combineActions } from 'redux-actions';
import { fromJS } from 'immutable';
import { objectToArray } from '../../../function';
import indexReducer, * as indexAction from './index';

/* 使用immutable初始化基础数据 */
const initData = fromJS({
  index: {}
});

/* reducer */
const reducer = handleActions({
  [combineActions(...objectToArray(indexAction))]: (state, action)=>{
    return state.set('index', indexReducer(state.get('index'), action));
  }
}, initData);

export default {
  playBackDownload: reducer
};