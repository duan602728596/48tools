// @flow
import { handleActions, combineActions } from 'redux-actions';
import { fromJS } from 'immutable';
import { objectToArray } from '../../../function';
import indexReducer, * as indexAction from './index';
import optionReducer, * as optionAction from './option';

/* 使用immutable初始化基础数据 */
const initData: {
  index: Object,
  option: Object
} = {
  index: {},
  option: {}
};

/* reducer */
const reducer: Function = handleActions({
  [combineActions(...objectToArray(indexAction))]: (state: Object, action: Object)=>{
    return state.set('index', indexReducer(state.get('index'), action));
  },
  [combineActions(...objectToArray(optionAction))]: (state: Object, action: Object): Object=>{
    return state.set('option', optionReducer(state.get('option'), action));
  }
}, fromJS(initData));

export default {
  bilibili: reducer
};