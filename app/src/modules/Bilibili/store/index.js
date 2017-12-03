import { createAction, handleActions } from 'redux-actions';
import option from '../../publicMethod/option';
import { db } from '../../publicMethod/initIndexedDB';

/* Action */
export const liveList: Function = createAction('B站直播列表');
export const liveList_delete: Function = createAction('B站直播列表-删除');
export const catching: Function = createAction('B站直播抓取');

export const cursorBilibiliLiveRoom: Function = db.cursorAction({
  objectStoreName: option.indexeddb.objectStore.bilibili.name,
  successAction: liveList
});
export const deleteBilibiliLiveRoom: Function = db.deleteAction({
  objectStoreName: option.indexeddb.objectStore.bilibili.name,
  successAction: liveList_delete
});

/* reducer */
const reducer: Function = handleActions({
  [liveList]: ($$state: Immutable.Map, action: Object): Immutable.Map=>{
    return $$state.set('liveList', action.payload.result);
  },
  [liveList_delete]: ($$state: Immutable.Map, action: Object): Immutable.Map=>{
    const arg: Object = action.payload;
    const data: Array = arg.query instanceof Array ? arg.query : [arg.query];
    const liveList: Array = $$state.get('liveList').slice();
    for(let i: number = liveList.length - 1; i >= 0; i--){
      if(data.indexOf(liveList[i].roomid) > -1){
        liveList.splice(i, 1);
      }
    }
    return $$state.set('liveList', liveList);
  },
  [catching]: ($$state: Immutable.Map, action: Object): Immutable.Map=>{
    const { liveList, catching }: {
      liveList: Array,
      catching: Map
    } = action.payload;
    return $$state.set('liveList', liveList)
      .set('catching', catching);
  }
}, {});

export default reducer;