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
export const liveList_delete = createAction('B站直播列表-删除');

export const cursorBilibiliLiveRoom = cursorAction({
  ...opt,
  successAction: liveList
});
export const deleteBilibiliLiveRoom = deleteAction({
  ...opt,
  successAction: liveList_delete
});

/* reducer */
const reducer = handleActions({
  [liveList]: (state, action)=>{
    return state.set('liveList', action.payload);
  },
  [liveList_delete]: (state, action)=>{
    const data = action.payload instanceof Array ? action.payload : [action.payload];
    const liveList = state.get('liveList').slice();
    for(let i = liveList.length - 1; i >= 0; i--){
      if(data.indexOf(liveList[i].roomid) > -1){
        liveList.splice(i, 1);
      }
    }
    return state.set('liveList', liveList);
  }
}, {});

export default reducer;