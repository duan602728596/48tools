import * as dayjs from 'dayjs';
import type { Dispatch } from '@reduxjs/toolkit';
import type { QChatMessage } from 'nim-web-sdk-ng/dist/QCHAT_BROWSER_SDK/QChatMsgServiceInterface';
import type { NIMChatroomMessage } from '@yxim/nim-web-sdk/dist/SDK/NIM_Web_Chatroom/NIMChatroomMessageInterface';
import { store } from '../../../../store/store';
import QChatSocket from './QChatSocket';
import NIM from './NIM';
import { setLog } from '../../reducers/qingchunshike';
import type { QingchunshikeUserItem, GiftResult, GiftText } from '../../types';

function filterLive(data: Array<NIMChatroomMessage>, st: number): { nextData: Array<GiftText['attach']>; isBreak: boolean } {
  const nextData: Array<GiftText['attach']> = [];
  let isBreak: boolean = false;

  for (const item of data) {
    if (item.time < st) {
      isBreak = true;
      break;
    } else if (item.type === 'custom' && item.custom) {
      const customJson: GiftText['attach'] = JSON.parse(item.custom);

      if ('giftInfo' in customJson && /^\d+(.\d+)?分$/.test(customJson.giftInfo.giftName)) {
        nextData.push(customJson);
      }
    }
  }

  return { nextData, isBreak };
}

function filterQChat(data: Array<QChatMessage>): Array<QChatMessage> {
  const nextData: Array<QChatMessage> = [];

  for (const item of data) {
    if (
      item.type === 'custom'
      && item?.attach?.messageType === 'GIFT_TEXT'
      && /^\d+(.\d+)?分$/.test(item.attach.giftInfo.giftName)
    ) {
      nextData.push(item);
    }
  }

  return nextData;
}

/* 计算房间 */
async function qchatCalculate(user: QingchunshikeUserItem, st: number, et: number, accid: string, pwd: string): Promise<Array<GiftResult>> {
  const dispatch: Dispatch = store.dispatch;
  const qchat: QChatSocket = new QChatSocket(accid, pwd);

  await qchat.init();

  // 获取数据
  const allHistoryMessage: Array<QChatMessage> = [];
  let endTime: number = et;       // 结束时间
  let excludeMsgId: string | undefined = undefined; // 排除ID
  let pageNum: number = 0;        // 日志

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const historyMessage: Array<QChatMessage> | null = await qchat.getHistoryMessage({
      serverId: String(user.serverId),
      channelId: String(user.channelId),
      beginTime: st,
      endTime,
      excludeMsgId
    });

    if (historyMessage?.length) {
      endTime = historyMessage.at(-1)!.time;

      const nextExcludeMsgId: string = historyMessage.at(-1)!.msgIdServer;

      if (excludeMsgId && excludeMsgId === nextExcludeMsgId) {
        break;
      } else {
        excludeMsgId = nextExcludeMsgId;
      }

      const nextData: Array<QChatMessage> = filterQChat(historyMessage);

      allHistoryMessage.push(...nextData);
      dispatch(setLog(`QChat -> 抓取page: ${ pageNum++ } endTime: ${
        dayjs(endTime).format('YYYY-MM-DD HH:mm:ss')
      } endTime - st: ${ endTime - st }`));
    } else {
      dispatch(setLog(`QChat -> 抓取结束: ${ pageNum++ } endTime: ${
        dayjs(endTime).format('YYYY-MM-DD HH:mm:ss')
      } endTime - st: ${ endTime - st }`));
      break;
    }
  }

  await qchat.disconnect();

  const giftResult: Array<GiftResult> = [];

  for (const msg of allHistoryMessage) {
    if (msg?.attach?.messageType === 'GIFT_TEXT') {
      giftResult.push({
        tpNum: Number(msg.attach.giftInfo.tpNum),
        giftNum: msg.attach.giftInfo.giftNum
      });
    }
  }

  return giftResult;
}

/* 直播计算 */
async function liveCalculate(user: QingchunshikeUserItem, st: number, et: number, accid: string, pwd: string): Promise<Array<GiftResult>> {
  const dispatch: Dispatch = store.dispatch;
  const nim: NIM = new NIM(accid, pwd, Number(user.liveRoomId));

  await nim.init();

  const allLiveHistoryMessage: Array<GiftText['attach']> = [];
  let liveEndTime: number = et;
  let livePageNum: number = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const historyMessage: Array<NIMChatroomMessage> = await nim.getHistoryMessage(liveEndTime);

    if (historyMessage?.length) {
      liveEndTime = historyMessage.at(-1)!.time;
      const { nextData, isBreak }: { nextData: Array<GiftText['attach']>; isBreak: boolean } = filterLive(historyMessage, st);

      allLiveHistoryMessage.push(...nextData);
      dispatch(setLog(`NIM -> 抓取结束: ${ livePageNum++ } endTime: ${
        dayjs(liveEndTime).format('YYYY-MM-DD HH:mm:ss')
      } endTime - st: ${ liveEndTime - st }`));

      if (isBreak) break;
    } else {
      break;
    }
  }

  await nim.disconnect();

  const giftResult: Array<GiftResult> = [];

  for (const { giftInfo } of allLiveHistoryMessage) {
    giftResult.push({
      tpNum: Number(giftInfo.tpNum),
      giftNum: giftInfo.giftNum
    });
  }

  return giftResult;
}

// 计算总票数以及每个票数的人数
export interface CalculateOneResult {
  tpNumList: Array<[string, number]>;
  all: number;
}

function calculateOne(result: Array<GiftResult>): CalculateOneResult {
  const tpNumMap: Record<string, number> = {};
  let all: number = 0;

  for (const { giftNum, tpNum } of result) {
    const key: string = String(tpNum);

    tpNumMap[key] ??= 0;
    tpNumMap[key] += giftNum;

    all += giftNum * tpNum;
  }

  const tpNumList: Array<[string, number]> = [];

  for (const key in tpNumMap) {
    tpNumList.push([key, tpNumMap[key]]);
  }

  return {
    tpNumList: tpNumList.sort(
      (a: [string, number], b: [string, number]): number => Number(a[0]) - Number(b[0])),
    all
  };
}

export interface CalculateResult {
  qchatCalculateResult: CalculateOneResult;
  nimCalculateResult: CalculateOneResult;
}

async function calculate(user: QingchunshikeUserItem, st: number, et: number, accid: string, pwd: string): Promise<CalculateResult> {
  const qchatCalculateResult: Array<GiftResult> = await qchatCalculate(user, st, et, accid, pwd);
  const nimCalculateResult: Array<GiftResult> = await liveCalculate(user, st, et, accid, pwd);

  return {
    qchatCalculateResult: calculateOne(qchatCalculateResult),
    nimCalculateResult: calculateOne(nimCalculateResult)
  };
}

export default calculate;