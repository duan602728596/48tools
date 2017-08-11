import { createAction, handleActions } from 'redux-actions';

/* Action */
export const liveList = createAction('直播列表');
export const liveCatch = createAction('直播抓取');
export const liveChange = createAction('直播列表和直播抓取');
export const autoRecording = createAction('自动录制');

/* reducer */
const reducer = handleActions({
  [liveList]: (state, action)=>{
    return state.set('liveList', action.payload.liveList);
  },
  [liveCatch]: (state, action)=>{
    return state.set('liveCatch', action.payload.map);
  },
  [liveChange]: (state, action)=>{
    return state.set('liveList', action.payload.liveList)
                .set('liveCatch', action.payload.map);
  },
  [autoRecording]: (state, action)=>{
    return state.set('autoRecording', action.payload.autoRecording);
  }
}, {});

export default reducer;