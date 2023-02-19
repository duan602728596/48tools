import * as dayjs from 'dayjs';
import { source, mp4Source } from '../../../utils/snh48';
import { rStr } from '../../../utils/utils';
import type { CustomMessageV2 } from '../services/interface';
import type { FormatCustomMessage, VIDEOMessageV2, AUDIOMessageV2, IMAGEMessageV2, UserV2, SendDataItem } from '../types';

/* 将数据格式化 */
export function FormatData(item: CustomMessageV2): FormatCustomMessage {
  const extInfoJson: Record<string, any> = JSON.parse(item.extInfo);
  const user: UserV2 = extInfoJson.user;
  const time: string = dayjs(item.msgTime).format('YYYY-MM-DD HH:mm:ss');
  const id: string = `${ item.msgIdClient }@${ rStr(50) }`;

  user.avatar = source(user.avatar);
  user.teamLogo = source(user.teamLogo);

  let newItem: FormatCustomMessage = {
    type: 'raw',
    body: item.bodys,
    extInfo: item.extInfo,
    user,
    time,
    msgIdClient: id
  };

  if (item.msgType === 'TEXT') {
    newItem = {
      type: 'text',
      body: item.bodys,
      user,
      time,
      msgIdClient: id
    };
  } else if (item.msgType === 'AUDIO' || item.msgType === 'VIDEO' || item.msgType === 'IMAGE') {
    newItem = {
      type: item.msgType.toLocaleLowerCase() as 'audio' | 'video' | 'image',
      attach: JSON.parse(item.bodys),
      user,
      time,
      msgIdClient: id
    } as VIDEOMessageV2 | AUDIOMessageV2 | IMAGEMessageV2;
    newItem.attach.url = source(newItem.attach.url);
  } else if ([
    'REPLY',
    'GIFTREPLY',
    'LIVEPUSH',
    'FLIPCARD',
    'FLIPCARD_AUDIO',
    'FLIPCARD_VIDEO',
    'EXPRESSIMAGE'
  ].includes(item.msgType)) {
    newItem = {
      type: 'custom',
      attach: JSON.parse(item.bodys),
      user,
      time,
      msgIdClient: id
    };
  }

  return newItem;
}

export function formatDataArray(data: Array<CustomMessageV2>): Array<FormatCustomMessage> {
  const newData: Array<FormatCustomMessage> = [];

  data.forEach((o: CustomMessageV2): void => {
    const newItem: FormatCustomMessage = FormatData(o);

    if (newItem.user.roleId === 3 && !(newItem.type === 'custom' && newItem.attach.messageType === 'PRESENT_TEXT')) {
      newData.push(newItem);
    }
  });

  return newData;
}

/* 保存的数据格式化 */
export function formatSendData(data: Array<CustomMessageV2>): Array<SendDataItem> {
  const newData: Array<SendDataItem> = [];

  data.forEach((o: CustomMessageV2) => {
    let bodys: string | Record<string, any>;
    let extInfo: string | Record<string, any>;

    if (o.msgType === 'TEXT') {
      bodys = o.bodys;
    } else {
      try {
        bodys = JSON.parse(o.bodys);
      } catch {
        bodys = o.bodys;
      }
    }

    try {
      extInfo = JSON.parse(o.extInfo);
    } catch {
      extInfo = o.extInfo;
    }

    // 处理user内的地址
    try {
      if (typeof extInfo === 'object') {
        extInfo['user']['teamLogo'] = source(extInfo['user']['teamLogo']);
        extInfo['user']['avatar'] = source(extInfo['user']['avatar']);
        extInfo['user']['pfUrl'] = source(extInfo['user']['pfUrl']);
      }
    } catch (err) {
      console.error(err);
    }

    try {
      if ((o.msgType === 'AUDIO' || o.msgType === 'VIDEO' || o.msgType === 'IMAGE') && typeof bodys === 'object') {
        bodys['url'] = source(bodys['url']);
      }
    } catch (err) {
      console.error(err);
    }

    try {
      if ((o.msgType === 'FLIPCARD_AUDIO' || o.msgType === 'FLIPCARD_VIDEO') && typeof bodys === 'object') {
        const keys: string[] = Object.keys(bodys);
        const keyName: string | undefined = keys.find((key: string): boolean => [
          'filpCardInfo', 'flipCardInfo',
          'filpCardAudioInfo', 'flipCardAudioInfo',
          'filpCardVideoInfo', 'flipCardVideoInfo'
        ].includes(key));

        if (keyName) {
          const answer: { url: string } = JSON.parse(bodys[keyName].answer);

          answer.url = mp4Source(answer.url);
          bodys[keyName].answer = JSON.stringify(answer);
        }
      }
    } catch (err) {
      console.error(err);
    }

    newData.push({
      bodys,
      extInfo,
      msgType: o.msgType,
      msgTime: dayjs(o.msgTime).format('YYYY-MM-DD HH:mm:ss')
    });
  });

  return newData;
}