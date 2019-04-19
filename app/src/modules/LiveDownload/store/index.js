import { createAction, handleActions } from 'redux-actions';
import { List } from 'immutable';

/* Action */
export const liveList = createAction('公演录播列表');
export const liveListInit = createAction('公演录播列表初始化');
export const changeGroup = createAction('公演录播选择团队');

/* reducer */
const reducer = handleActions({
  [liveList]: ($$state, action) => {
    return $$state.set('liveList', List(action.payload.liveList));
  },
  [liveListInit]: ($$state, action) => {
    const { liveList, page, pageLen } = action.payload;

    return $$state.set('liveList', List(liveList))
      .set('page', page)
      .set('pageLen', pageLen);
  },
  [changeGroup]: ($$state, action) => {
    return $$state.set('group', action.payload.group);
  }
}, {});

export default reducer;