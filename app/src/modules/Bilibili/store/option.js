import { createAction, handleActions } from 'redux-actions';
import option from '../../publicMethod/option';
import { db } from '../../publicMethod/initIndexedDB';

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
export const putBilibiliLiveRoom: Function = db.putAction(opt);

/* reducer */
const reducer: Function = handleActions({}, {});

export default reducer;