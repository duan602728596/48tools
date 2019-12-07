import { createAction, handleActions } from 'redux-actions';
import { List } from 'immutable';
import option from '../../../components/option/option';
import { db } from '../../../components/indexedDB/initIndexedDB';

/* Action */
export const liveList = createAction('B站直播列表');
export const liveList_delete = createAction('B站直播列表-删除');
export const catching = createAction('B站直播抓取');

export const cursorBilibiliLiveRoom = db.cursorAction({
  objectStoreName: option.indexeddb.objectStore.bilibili.name,
  successAction: liveList
});
export const deleteBilibiliLiveRoom = db.deleteAction({
  objectStoreName: option.indexeddb.objectStore.bilibili.name,
  successAction: liveList_delete
});

/* reducer */
const reducer = handleActions({
  [liveList]: ($$state, action) => {
    return $$state.set('liveList', List(action.payload.result));
  },
  [liveList_delete]: ($$state, action) => {
    const arg = action.payload;
    const data = arg.query instanceof Array ? arg.query : [arg.query];
    const liveList = $$state.get('liveList').toJS();

    for (let i = liveList.length - 1; i >= 0; i--) {
      if (data.indexOf(liveList[i].roomid) > -1) {
        liveList.splice(i, 1);
      }
    }

    return $$state.set('liveList', List(liveList));
  },
  [catching]: ($$state, action) => {
    const { liveList, catching } = action.payload;

    return $$state.set('liveList', List(liveList))
      .set('catching', catching);
  }
}, {});

export default reducer;