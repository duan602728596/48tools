import { createAction, handleActions } from 'redux-actions';
import { getAction, deleteAction } from 'indexeddb-tools-redux';
import option from '../../pubmicMethod/option';

const opt = {
  name: option.indexeddb.name,
  version: option.indexeddb.version,
  objectStoreName: option.indexeddb.objectStore.bilibili.name
};

/* Action */
export const getBilibiliLiveRoom = getAction(opt);
export const deleteBilibiliLiveRoom = deleteAction(opt);

/* reducer */
const reducer = handleActions({}, {});

export default reducer;