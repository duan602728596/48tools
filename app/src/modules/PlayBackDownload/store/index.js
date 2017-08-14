// @flow
import { createAction, handleActions } from 'redux-actions';

/* Action */
export const playBackList: Function = createAction('录播列表');

/* reducer */
const reducer: Function = handleActions({
  [playBackList]: (state: Object, action: Object): Object=>{
    const { giftUpdTime, playBackList }: {
      giftUpdTime: number,
      playBackList: Array
    } = action.payload;
    return state.set('playBackList', playBackList)
      .set('giftUpdTime', giftUpdTime);
  }
}, {});

export default reducer;