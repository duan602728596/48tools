import { createAction, handleActions } from 'redux-actions';
import { List } from 'immutable';

/* Action */
export const liveList: Function = createAction('公演录播列表');
export const liveListInit: Function = createAction('公演录播列表初始化');
export const changeGroup: Function = createAction('公演录播选择团队');

/* reducer */
type ll = {
  id: string,
  title: string,
  secondTitle: string
}[];
const reducer: Function = handleActions({
  [liveList]: ($$state: Immutable.Map, action: Object): Immutable.Map=>{
    return $$state.set('liveList', List(action.payload.liveList));
  },
  [liveListInit]: ($$state: Object, action: Object): Immutable.Map=>{
    const { liveList, page, pageLen }: {
      liveList: ll,
      page: number,
      pageLen: number
    } = action.payload;
    return $$state.set('liveList', List(liveList))
      .set('page', page)
      .set('pageLen', pageLen);
  },
  [changeGroup]: ($$state: Object, action: Object): Immutable.Map=>{
    return $$state.set('group', action.payload.group);
  }
}, {});

export default reducer;