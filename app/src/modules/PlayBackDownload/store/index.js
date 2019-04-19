import { createAction, handleActions } from 'redux-actions';
import { List } from 'immutable';

/* Action */
export const playBackList = createAction('录播列表');

/* reducer */
const reducer = handleActions({
  [playBackList]: ($$state, action) => {
    const { giftUpdTime, playBackList } = action.payload;

    return $$state.set('playBackList', List(playBackList))
      .set('giftUpdTime', giftUpdTime);
  }
}, {});

export default reducer;