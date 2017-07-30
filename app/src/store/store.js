/* 全局的store */
import { createStore } from 'redux';
import reducers from './reducers';
import { Map } from 'immutable';
import { combineReducers } from 'redux-immutable';

/* reducer列表 */
const reducer = combineReducers(reducers);

/* initialState */
const initialState = Map();

/* store */
const store = createStore(reducer, initialState);

export default store;