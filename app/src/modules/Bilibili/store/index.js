import { createAction, handleActions } from 'redux-actions';
import { cursorAction, deleteAction } from 'indexeddb-tools-redux';
import option from '../../pubmicMethod/option';

const opt = {
  name: option.indexeddb.name,
  version: option.indexeddb.version,
  objectStoreName: option.indexeddb.objectStore.bilibili.name
};

/* Action */
export const liveList = createAction('B站直播列表');

export const cursorBilibiliLiveRoom = cursorAction({
  ...opt,
  successAction: liveList
});
export const deleteBilibiliLiveRoom = deleteAction(opt);

/* reducer */
const reducer = handleActions({
  [liveList]: (state, action)=>{
    return state.set('liveList', action.payload);
  }
}, {});

export default reducer;