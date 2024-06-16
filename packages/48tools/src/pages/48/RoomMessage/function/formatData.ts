import * as dayjs from 'dayjs';
import type { CustomMessageV2 } from '@48tools-api/48';
import { source, mp4Source } from '../../../../utils/snh48';
import { rStr } from '../../../../utils/utils';
import type { FormatCustomMessage, VIDEOMessageV2, AUDIOMessageV2, IMAGEMessageV2, UserV2, SendDataItem } from '../../types';

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

    if (
      newItem.user.roleId === 3
      && !(newItem.type === 'custom' && ['PRESENT_TEXT', 'RED_PACKET_2024'].includes(newItem.attach.messageType))
    ) {
      newData.push(newItem);
    }
  });

  return newData;
}

/* 保存的数据格式化 */
export function formatSendData(data: Array<CustomMessageV2>): Array<SendDataItem> {
  const newData: Array<SendDataItem> = [];

  data.forEach((o: CustomMessageV2): void => {
    let bodys: string | SendDataItem['bodys'];
    let extInfo: string | SendDataItem['extInfo'];

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
      if (typeof extInfo !== 'string') {
        Object.assign(extInfo.user, {
          teamLogo: source(extInfo.user.teamLogo),
          avatar: source(extInfo.user.avatar),
          pfUrl: source(extInfo.user.pfUrl)
        });

        // 是否包含房主的消息
        if (extInfo.user.roleId !== 3) {
          return;
        }
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

    newData.push(<SendDataItem>{
      bodys,
      extInfo,
      msgType: o.msgType,
      msgTime: dayjs(o.msgTime).format('YYYY-MM-DD HH:mm:ss')
    });
  });

  return newData;
}