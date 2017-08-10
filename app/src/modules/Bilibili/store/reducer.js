import { handleActions, combineActions } from 'redux-actions';
import { fromJS } from 'immutable';
import { objectToArray } from '../../../function';
import indexReducer, * as indexAction from './index';
import optionReducer, * as optionAction from './option';

/* 使用immutable初始化基础数据 */
const initData = fromJS({
  index: {},
  option: {}
});

/* reducer */
const reducer = handleActions({
  [combineActions(...objectToArray(indexAction))]: (state, action)=>{
    return state.set('index', indexReducer(state.get('index'), action));
  },
  [combineActions(...objectToArray(optionAction))]: (state, action)=>{
    return state.set('option', optionReducer(state.get('option'), action));
  }
}, initData);

export default {
  bilibili: reducer
};