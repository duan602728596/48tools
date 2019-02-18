import { createAction, handleActions } from 'redux-actions';
import { List } from 'immutable';

/* Action */
export const playBackList: Function = createAction('录播列表');

/* reducer */
const reducer: Function = handleActions({
  [playBackList]: ($$state: Immutable.Map, action: Object): Immutable.Map => {
    const { giftUpdTime, playBackList }: {
      giftUpdTime: number,
      playBackList: Array
    } = action.payload;

    return $$state.set('playBackList', List(playBackList))
      .set('giftUpdTime', giftUpdTime);
  }
}, {});

export default reducer;