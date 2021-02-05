import type { Store, Dispatch } from 'redux';
import { store } from '../../store/store';
import { requestTopicContent, requestTopicCheckin } from './services/weiboSuper';
import { setCheckIn, setCheckinList, WeiboSuperInitialState } from './reducers/weiboSuper';
import type { TopicResponse, CheckinResult } from './services/interface';
import type { SuperItem, WeiboCheckinResult } from './types';

/* 签到 */
async function checkIn(
  state: WeiboSuperInitialState,
  dispatch: Dispatch,
  cookie: string,
  list: Array<SuperItem>
): Promise<void> {
  for (const item of list) {
    if (!state.checkIn) {
      break;
    }

    const superId: string = item.oid.split(/:/)[1];
    const result: WeiboCheckinResult = {
      title: item.title,
      pic: item.pic,
      superId
    };
    const res: CheckinResult = await requestTopicCheckin(cookie, superId);

    Object.assign(result, {
      code: Number(res.code),
      result: res.code === 100000
        ? `${ res.data.alert_title } ${ res.data.alert_subtitle }`
        : (res.msg && res.msg !== '' ? res.msg : '签到失败')
    });

    dispatch(setCheckinList(result));
  }
}

/**
 * 微博签到
 * @param { string } cookie: 账号cookie
 */
async function weiboCheckIn(cookie: string): Promise<void> {
  const { getState, dispatch }: Store = store;
  const state: WeiboSuperInitialState = getState().weiboSuper;
  let cont: boolean = true;
  let pageIndex: number = 1;

  // 签到
  while (cont && state.checkIn) {
    const resTopic: TopicResponse = await requestTopicContent(cookie, pageIndex);

    if (resTopic?.data?.list?.length) {
      const list: Array<SuperItem> = resTopic.data.list;

      await checkIn(state, dispatch, cookie, list);
      pageIndex++;
    } else {
      cont = false;
    }
  }

  dispatch(setCheckIn(false));
}

export default weiboCheckIn;