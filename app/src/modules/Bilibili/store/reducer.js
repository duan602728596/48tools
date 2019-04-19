import { handleActions, combineActions } from 'redux-actions';
import { fromJS } from 'immutable';
import indexReducer, * as indexAction from './index';
import optionReducer, * as optionAction from './option';

/* 使用immutable初始化基础数据 */
const initData = {
  index: {},
  option: {}
};

/* reducer */
const reducer = handleActions({
  [combineActions(...Object.values(indexAction))]: ($$state, action) => {
    return $$state.set('index', indexReducer($$state.get('index'), action));
  },
  [combineActions(...Object.values(optionAction))]: ($$state, action) => {
    return $$state.set('option', optionReducer($$state.get('option'), action));
  }
}, fromJS(initData));

export default {
  bilibili: reducer
};