import { createAction, handleActions } from 'redux-actions';

/* Action */
export const liveList: Function = createAction('直播列表');
export const liveCatch: Function = createAction('直播抓取');
export const liveChange: Function = createAction('直播列表和直播抓取');
export const autoRecording: Function = createAction('自动录制');

/* reducer */
const reducer: Function = handleActions({
  [liveList]: ($$state: Immutable.Map, action: Object): Immutable.Map=>{
    return $$state.set('liveList', action.payload.liveList);
  },
  [liveCatch]: ($$state: Immutable.Map, action: Object): Immutable.Map=>{
    return $$state.set('liveCatch', action.payload.map);
  },
  [liveChange]: ($$state: Immutable.Map, action: Object): Immutable.Map=>{
    return $$state.set('liveList', action.payload.liveList)
      .set('liveCatch', action.payload.map);
  },
  [autoRecording]: ($$state: Immutable.Map, action: Object): Immutable.Map=>{
    return $$state.set('autoRecording', action.payload.autoRecording);
  }
}, {});

export default reducer;