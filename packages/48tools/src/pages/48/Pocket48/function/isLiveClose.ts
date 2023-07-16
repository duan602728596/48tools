import { rStr } from '../../../../utils/snh48';
import type { WorkerEventData } from './Pocket48LiveDownload.worker/Pocket48LiveDownload.worker';

export type LiveStatusEventData = {
  type: 'live_status';
  rid: string;
  result: boolean;
};

/* 判断直播是否结束 */
export function isLiveClose(workerData: WorkerEventData): Promise<boolean> {
  const rid: string = rStr(30);

  return new Promise((resolve: Function, reject: Function): void => {
    function handleListeningMessage(event: MessageEvent<LiveStatusEventData>): void {
      if (event.data.type === 'live_status' && event.data.rid === rid) {
        resolve(event.data.result);
      }
    }

    addEventListener('message', handleListeningMessage);
    postMessage({
      type: 'live_status',
      liveId: workerData.liveId,
      roomId: workerData.roomId,
      rid
    });
  });
}