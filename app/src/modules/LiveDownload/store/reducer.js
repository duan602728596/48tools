// @flow
import { handleActions, combineActions } from 'redux-actions';
import { fromJS } from 'immutable';
import { objectToArray } from '../../../function';
import indexReducer, * as indexAction from './index';

/* 使用immutable初始化基础数据 */
const initData: {
  index: Object
} = {
  index: {}
};

/* reducer */
const reducer: Function = handleActions({
  [combineActions(...objectToArray(indexAction))]: (state: Object, action: Object)=>{
    return state.set('index', indexReducer(state.get('index'), action));
  }
}, fromJS(initData));

export default {
  liveDownload: reducer
};