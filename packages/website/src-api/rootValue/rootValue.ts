import { requestLiveList, requestLiveRoomInfo, requestRoomId } from '../services/pocket48.js';
import type {
  LiveInfo,
  LiveData,
  LiveRoomInfoContent,
  LiveRoomInfo,
  RoomInfo
} from '../services/interface';
import type {
  RecordValueLiveInfo,
  RecordValue,
  RootValue,
  RecordContext
} from './types';

/* 获取录播信息 */
async function record(ctx: RecordContext): Promise<RecordValue> {
  const liveListRes: LiveData = await requestLiveList(ctx.next ?? '0', false, undefined, ctx.userId);

  return {
    next: liveListRes.content.next,
    liveList: liveListRes.content.liveList.map((item: LiveInfo): RecordValueLiveInfo => {
      return {
        ...item,
        async liveRoomInfo(): Promise<LiveRoomInfoContent> {
          const liveRoomInfoRes: LiveRoomInfo = await requestLiveRoomInfo(item.liveId);

          return liveRoomInfoRes.content;
        }
      };
    }),
    liveRoomInfo(): Promise<Array<LiveRoomInfoContent>> {
      return Promise.all((ctx.liveId ?? []).map(async (liveId: string): Promise<LiveRoomInfoContent> => {
        const liveRoomInfoRes: LiveRoomInfo = await requestLiveRoomInfo(liveId);

        return liveRoomInfoRes.content;
      }));
    }
  };
}

/* 获取roomInfo */
async function roomInfo(): Promise<RoomInfo> {
  const roomInfoRes: RoomInfo = await requestRoomId();

  return roomInfoRes;
}

/* graphql入口文件 */
function rootValue(): RootValue {
  return {
    record,
    roomInfo
  };
}

export default rootValue;