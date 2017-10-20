// @flow
import { createAction, handleActions } from 'redux-actions';
import { cursorAction, deleteAction } from 'indexeddb-tools-redux';
import option from '../../publicMethod/option';

const opt: {
  name: string,
  version: number,
  objectStoreName: string
} = {
  name: option.indexeddb.name,
  version: option.indexeddb.version,
  objectStoreName: option.indexeddb.objectStore.bilibili.name
};

/* Action */
export const liveList: Function = createAction('B站直播列表');
export const liveList_delete: Function = createAction('B站直播列表-删除');
export const catching: Function = createAction('B站直播抓取');

export const cursorBilibiliLiveRoom: Function = cursorAction({
  ...opt,
  successAction: liveList
});
export const deleteBilibiliLiveRoom: Function = deleteAction({
  ...opt,
  successAction: liveList_delete
});

/* reducer */
const reducer: Function = handleActions({
  [liveList]: (state: Object, action: Object): Object=>{
    return state.set('liveList', action.payload);
  },
  [liveList_delete]: (state: Object, action: Object): Object=>{
    const arg: Object = action.payload;
    const data: Array = arg.data instanceof Array ? arg.data : [arg.data];
    const liveList: Array = state.get('liveList').slice();
    for(let i: number = liveList.length - 1; i >= 0; i--){
      if(data.indexOf(liveList[i].roomid) > -1){
        liveList.splice(i, 1);
      }
    }
    return state.set('liveList', liveList);
  },
  [catching]: (state: Object, action: Object): Object=>{
    const { liveList, catching }: {
      liveList: Array,
      catching: Map
    } = action.payload;
    return state.set('liveList', liveList)
      .set('catching', catching);
  }
}, {});

export default reducer;