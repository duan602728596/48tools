import { requestLiveList, requestLiveRoomInfo, type LiveData, type LiveInfo, type LiveRoomInfo } from '@48tools-api/48';

/* 判断当前liveId对应的直播是否已经结束 */
async function liveStatus(liveId: string): Promise<LiveRoomInfo | null> {
  try {
    const res: LiveData = await requestLiveList('0', true);
    const liveList: Array<LiveInfo> = res.content.liveList ?? [];
    const item: LiveInfo | undefined = liveList.find((liveInfo: LiveInfo): boolean => liveInfo.liveId === liveId);

    if (item && item.status === 2) {
      const one: LiveRoomInfo = await requestLiveRoomInfo(liveId);

      if (one.success) {
        console.log('liveStatus:', item, one);

        return one;
      } else {
        return null;
      }
    } else {
      return null;
    }
  } catch (err) {
    console.error(err);

    return null;
  }
}

export default liveStatus;