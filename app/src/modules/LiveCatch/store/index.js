import { createAction, handleActions } from 'redux-actions';
import { List } from 'immutable';
import { oldArray } from '../Index/utils';

/* Action */
export const liveList = createAction('直播列表');
export const liveCatch = createAction('直播抓取');
export const liveChange = createAction('直播列表和直播抓取');
export const autoRecording = createAction('自动录制');

/* reducer */
const reducer = handleActions({
  [liveList]: ($$state, action) => {
    const ll = action.payload.liveList;
    const s$ll = $$state.has('liveList') ? $$state.get('liveList').toJS() : [];
    const s$lc = $$state.get('liveCatch');
    // 获取旧的直播录制列表
    const oa = oldArray(s$ll, ll, s$lc);

    return $$state.set('liveList', List([...ll, ...oa]));
  },
  [liveCatch]: ($$state, action) => {
    return $$state.set('liveCatch', action.payload.map);
  },
  [liveChange]: ($$state, action) => {
    const ll = action.payload.liveList;
    const s$ll = $$state.has('liveList') ? $$state.get('liveList').toJS() : [];
    const s$lc = $$state.get('liveCatch');
    // 获取旧的直播录制列表
    const oa = oldArray(s$ll, ll, s$lc);

    return $$state.set('liveList', List([...ll, ...oa]))
      .set('liveCatch', action.payload.map);
  },
  [autoRecording]: ($$state, action) => {
    return $$state.set('autoRecording', action.payload.autoRecording);
  }
}, {});

export default reducer;