import { createAction, handleActions } from 'redux-actions';
import option from '../../../components/option/option';
import { db } from '../../../components/indexedDB/initIndexedDB';

const opt = {
  name: option.indexeddb.name,
  version: option.indexeddb.version,
  objectStoreName: option.indexeddb.objectStore.bilibili.name
};

/* Action */
export const putBilibiliLiveRoom = db.putAction(opt);

/* reducer */
const reducer = handleActions({}, {});

export default reducer;