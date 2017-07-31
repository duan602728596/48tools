import { createAction, handleActions } from 'redux-actions';

/* Action */
export const liveList = createAction('直播列表');
export const liveCache = createAction('直播抓取');
export const liveChange = createAction('直播列表和直播抓取');
export const autoRecording = createAction('自动录制');

/* reducer */
const reducer = handleActions({
  [liveList]: (state, action)=>{
    return state.set('liveList', action.payload.liveList);
  },
  [liveCache]: (state, action)=>{
    return state.set('liveCache', action.payload.map);
  },
  [liveChange]: (state, action)=>{
    return state.set('liveList', action.payload.liveList)
                .set('liveCache', action.payload.map);
  },
  [autoRecording]: (state, action)=>{
    return state.set('autoRecording', action.payload.autoRecording);
  }
}, {});

export default reducer;