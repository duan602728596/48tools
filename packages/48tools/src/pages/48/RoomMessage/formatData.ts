import * as dayjs from 'dayjs';
import { source } from '../../../utils/snh48';
import { rStr } from '../../../utils/utils';
import type { CustomMessageV2 } from '../services/interface';
import type { FormatCustomMessage, VIDEOMessageV2, AUDIOMessageV2, IMAGEMessageV2, UserV2 } from '../types';

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