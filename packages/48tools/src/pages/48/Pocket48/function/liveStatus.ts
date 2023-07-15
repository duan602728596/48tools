import { requestLiveList, type LiveData, type LiveInfo } from '@48tools-api/48';

/* 判断当前liveId对应的直播是否已经结束 */
async function liveStatus(liveId: string): Promise<boolean> {
  try {
    const res: LiveData = await requestLiveList('0', true);
    const liveList: Array<LiveInfo> = res.content.liveList ?? [];

    return liveList.some((liveInfo: LiveInfo): boolean => liveInfo.liveId === liveId);
  } catch (err) {
    console.error(err);

    return false;
  }
}

export default liveStatus;