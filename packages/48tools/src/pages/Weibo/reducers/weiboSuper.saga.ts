import { createAction, type PayloadActionCreator, type PayloadAction } from '@reduxjs/toolkit';
import { takeEvery, put, fork, cancel, call, delay, all } from 'redux-saga/effects';
import type { Task } from 'redux-saga';
import type { MessageInstance } from 'antd/es/message/interface';
import { requestTopicContent, requestTopicCheckin, type TopicResponse, type CheckinResult, type SuperItem } from '@48tools-api/weibo/super';
import { setCheckIn, updateCheckInList } from './weiboSuper';
import type { Quantity, WeiboCheckinResult } from '../types';

interface RunWeiboSuperCheckinStartActionPayload {
  messageApi: MessageInstance;
  cookie: string;
}

export const runWeiboSuperCheckinStartAction: PayloadActionCreator<RunWeiboSuperCheckinStartActionPayload> = createAction('weiboSuper/runWeiboSuperCheckinStart');
export const runWeiboSuperCheckinStopAction: PayloadActionCreator = createAction('weiboSuper/runWeiboSuperCheckinStop');

let checkInTask: Task | null = null; // 签到task

/* 单个微博签到 */
function *weiboCheckInItem(cookie: string, list: Array<SuperItem>, quantity: Quantity): Generator {
  for (const item of list) {
    const superId: string = item.oid.split(/:/)[1];
    const result: WeiboCheckinResult = {
      title: item.title,
      pic: item.pic,
      superId,
      content1: item.content1,
      link: item.link
    };

    quantity.checkedInLen += 1;

    const res: CheckinResult = (yield call(requestTopicCheckin, cookie, superId)) as CheckinResult;

    Object.assign(result, {
      code: Number(res.code),
      result: Number(res.code) === 100000
        ? `${ res.data.alert_title } ${ res.data.alert_subtitle }`
        : (res.msg && res.msg !== '' ? res.msg : '签到失败')
    });

    yield put(updateCheckInList({
      result,
      quantity: { ...quantity }
    }));
    yield delay(1_300);
  }
}

/**
 * 微博签到
 * @param { MessageInstance } messageApi
 * @param { string } cookie - 账号cookie
 */
function *weiboCheckIn(messageApi: MessageInstance, cookie: string): Generator {
  const quantity: Quantity = { checkedInLen: 0, total: 0 };
  let cont: boolean = true;  // 是否继续
  let pageIndex: number = 1; // 页码

  // 签到
  while (cont) {
    const resTopic: TopicResponse = (yield call(requestTopicContent, cookie, pageIndex)) as TopicResponse;

    if (Number(resTopic.ok) !== 1) {
      messageApi.error(`获取超话列表失败，请重新登陆！(Error: ${ resTopic.ok })`);
      cont = false;
      break;
    }

    if (resTopic?.data?.list?.length) {
      const list: Array<SuperItem> = resTopic.data.list;

      quantity.total += resTopic.data.total_number;
      yield call(weiboCheckInItem, cookie, list, quantity);
      pageIndex++;
    } else {
      cont = false;
    }
  }
}

/* 开始签到 */
function *weiboSuperCheckinStartSaga(action: PayloadAction<RunWeiboSuperCheckinStartActionPayload>): Generator {
  yield put(setCheckIn(true));
  checkInTask = (yield fork(weiboCheckIn, action.payload.messageApi, action.payload.cookie)) as Task;
}

/* 停止签到 */
function *weiboSuperCheckinStopSaga(): Generator {
  if (checkInTask) {
    yield cancel(checkInTask);
    checkInTask = null;
  }

  yield put(setCheckIn(false));
}

function *weiboSuperRootSaga(): Generator {
  yield all([
    takeEvery(runWeiboSuperCheckinStartAction.type, weiboSuperCheckinStartSaga),
    takeEvery(runWeiboSuperCheckinStopAction.type, weiboSuperCheckinStopSaga)
  ]);
}

export default weiboSuperRootSaga;