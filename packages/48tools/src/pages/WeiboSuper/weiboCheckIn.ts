import type { Store, Dispatch } from 'redux';
import { message } from 'antd';
import { store } from '../../store/store';
import { requestTopicContent } from './services/weiboSuper';
import { setCheckIn, reqTopicCheckin } from './reducers/weiboSuper';
import type { TopicResponse } from './services/interface';
import type { SuperItem, WeiboCheckinResult, Quantity } from './types';

function sleep(time: number): Promise<void> {
  return new Promise((resolve: Function, reject: Function) => {
    setTimeout(resolve, time);
  });
}

/* 签到 */
async function checkIn(
  getState: Function,
  dispatch: Dispatch,
  cookie: string,
  list: Array<SuperItem>,
  quantity: Quantity
): Promise<void> {
  for (const item of list) {
    if (!getState().weiboSuper.checkIn) {
      break;
    }

    const superId: string = item.oid.split(/:/)[1];
    const result: WeiboCheckinResult = {
      title: item.title,
      pic: item.pic,
      superId,
      content1: item.content1,
      link: item.link
    };

    quantity.checkedInLen += 1;
    await dispatch<any>(reqTopicCheckin({
      cookie,
      superId,
      result,
      quantity
    }));
    await sleep(1_500);
  }
}

/**
 * 微博签到
 * @param { string } cookie: 账号cookie
 */
async function weiboCheckIn(cookie: string): Promise<void> {
  const { getState, dispatch }: Store = store;
  const quantity: Quantity = {
    checkedInLen: 0,
    total: 0
  };
  let cont: boolean = true;
  let pageIndex: number = 1;

  // 签到
  while (cont) {
    const resTopic: TopicResponse = await requestTopicContent(cookie, pageIndex);

    if (Number(resTopic.ok) !== 1) {
      message.error(`获取超话列表失败，请重新登陆！(Error: ${ resTopic.ok })`);
      cont = false;
      break;
    }

    if (resTopic?.data?.list?.length) {
      const list: Array<SuperItem> = resTopic.data.list;

      quantity.total = resTopic.data.total_number;
      await checkIn(getState, dispatch, cookie, list, quantity);
      pageIndex++;
    } else {
      cont = false;
    }

    if (!getState().weiboSuper.checkIn) {
      cont = false;
    }
  }

  dispatch(setCheckIn(false));
}

export default weiboCheckIn;