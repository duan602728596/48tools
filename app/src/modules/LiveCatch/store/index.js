import { createAction, handleActions } from 'redux-actions';
import { List } from 'immutable';
import { oldArray } from '../Index/unit';

/* Action */
export const liveList: Function = createAction('直播列表');
export const liveCatch: Function = createAction('直播抓取');
export const liveChange: Function = createAction('直播列表和直播抓取');
export const autoRecording: Function = createAction('自动录制');

/* reducer */
const reducer: Function = handleActions({
  [liveList]: ($$state: Immutable.Map, action: Object): Immutable.Map=>{
    const ll: Array = action.payload.liveList;
    const s$ll: Array = $$state.get('liveList')?.toJS() || [];
    const s$lc: Map = $$state.get('liveCatch');
    // 获取旧的直播录制列表
    const oa: Array = oldArray(s$ll, ll, s$lc);
    return $$state.set('liveList', List([...ll, ...oa]));
  },
  [liveCatch]: ($$state: Immutable.Map, action: Object): Immutable.Map=>{
    return $$state.set('liveCatch', action.payload.map);
  },
  [liveChange]: ($$state: Immutable.Map, action: Object): Immutable.Map=>{
    const ll: Array = action.payload.liveList;
    const s$ll: Array = $$state.get('liveList').toJS();
    const s$lc: Map = $$state.get('liveCatch');
    // 获取旧的直播录制列表
    const oa: Array = oldArray(s$ll, ll, s$lc);
    return $$state.set('liveList', List([...ll, ...oa]))
      .set('liveCatch', action.payload.map);
  },
  [autoRecording]: ($$state: Immutable.Map, action: Object): Immutable.Map=>{
    return $$state.set('autoRecording', action.payload.autoRecording);
  }
}, {});

export default reducer;