import { createAction, handleActions, combineActions } from 'redux-actions';
import { fromJS, List } from 'immutable';

/* 使用immutable初始化基础数据 */
const initData = {
  index: {},
  downloadList: new Map(), // 下载列表
  playBackList: [],
  giftUpdTime: 0
};

/* Action */
export const downloadList = createAction('下载列表');
export const playBackList = createAction('录播列表');
export const renderList = createAction('渲染列表');

/* reducer */
const reducer = handleActions({
  [downloadList]: ($$state, action) => {
    return $$state.set('downloadList', action.payload.downloadList);
  },
  [playBackList]: ($$state, action) => {
    const { giftUpdTime, playBackList } = action.payload;

    return $$state.set('playBackList', List(playBackList))
      .set('giftUpdTime', giftUpdTime);
  },
  [renderList]: ($$state, action) => {
    const { downloadList, playBackList } = action.payload;

    return $$state.set('downloadList', downloadList)
      .set('playBackList', List(playBackList));
  }
}, fromJS(initData));

export default {
  playBackDownload: reducer
};