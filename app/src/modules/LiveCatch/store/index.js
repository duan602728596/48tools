// @flow
import { createAction, handleActions } from 'redux-actions';

/* Action */
export const liveList: Function = createAction('直播列表');
export const liveCatch: Function = createAction('直播抓取');
export const liveChange: Function = createAction('直播列表和直播抓取');
export const autoRecording: Function = createAction('自动录制');

/* reducer */
const reducer: Function = handleActions({
  [liveList]: (state: Object, action: Object): Object=>{
    return state.set('liveList', action.payload.liveList);
  },
  [liveCatch]: (state: Object, action: Object): Object=>{
    return state.set('liveCatch', action.payload.map);
  },
  [liveChange]: (state: Object, action: Object): Object=>{
    return state.set('liveList', action.payload.liveList)
      .set('liveCatch', action.payload.map);
  },
  [autoRecording]: (state: Object, action: Object): Object=>{
    return state.set('autoRecording', action.payload.autoRecording);
  }
}, {});

export default reducer;