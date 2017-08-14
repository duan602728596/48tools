import { createAction, handleActions } from 'redux-actions';
import { putAction } from 'indexeddb-tools-redux';
import option from '../../pubmicMethod/option';

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
export const putBilibiliLiveRoom: Function = putAction(opt);

/* reducer */
const reducer: Function = handleActions({}, {});

export default reducer;