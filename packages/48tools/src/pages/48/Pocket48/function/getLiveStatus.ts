import type { NIMChatroomMessage } from '@yxim/nim-web-sdk/dist/SDK/NIM_Web_Chatroom/NIMChatroomMessageInterface';
import NIM from '../../Qingchunshike/function/NIM';

/* 使用SDK判断是否结束直播 */
async function getLiveStatus(roomId: string, liveId: string): Promise<boolean> {
  const nim: NIM = new NIM('', '', roomId, true);

  await nim.init();

  const history: Array<NIMChatroomMessage> = await nim.getHistoryMessage();
  const result: boolean = history.some((o: NIMChatroomMessage): boolean => {
    if (o.type === 'custom' && typeof o.custom === 'string') {
      const customJson: any = JSON.parse(o.custom);

      if (customJson.type === 'CLOSELIVE') {
        const customJson2: any = JSON.parse(
          o.custom.replace(/\d+/, (v: string): string => `"${ v }"`)
            .replace(/"{2}/g, '"'));

        return customJson2.sourceId === liveId;
      } else {
        return false;
      }
    } else {
      return false;
    }
  });

  nim.disconnect();

  return result;
}

export default getLiveStatus;