import * as path from 'path';
import type { Store } from 'redux';
import { message } from 'antd';
import * as moment from 'moment';
import { findIndex } from 'lodash-es';
import FFMpegDownloadWorker from 'worker-loader!../../../../utils/worker/FFMpegDownload.Worker';
import type { MessageEventData } from '../../../../utils/worker/FFMpegDownload.Worker';
import { store } from '../../../../store/store';
import { setLiveList, Pocket48InitialState, setDeleteLiveChildList, setAddLiveChildList } from '../../reducers/pocket48';
import { requestLiveList, requestLiveRoomInfo } from '../../services/pocket48';
import { getFFmpeg } from '../../../../utils/utils';
import type { LiveData, LiveInfo, UserInfo, LiveRoomInfo } from '../../services/interface';

/* 自动抓取 */
async function autoGrab(dir: string, usersArr: string[]): Promise<void> {
  const { dispatch, getState }: Store = store;
  const res: LiveData = await requestLiveList('0', true);
  const liveList: Array<LiveInfo> = res.content.liveList; // 自动刷新获取直播列表

  dispatch(setLiveList(liveList));

  // 过滤，只保留xox信息
  const humanRegExp: RegExp = new RegExp(`(${ usersArr.join('|') })`, 'i'); // 正则
  const { liveChildList }: Pocket48InitialState = getState().pocket48;

  for (const item of liveList) {
    const { userId, nickname }: UserInfo = item.userInfo;
    const index: number = findIndex(liveChildList, { id: item.liveId });

    // 正则匹配或者id完全匹配
    if ((humanRegExp.test(nickname) || usersArr.includes[userId]) && index < 0) {
      const time: string = moment().format('YYYY_MM_DD_HH_mm_ss');
      const filePath: string = path.join(dir, `[口袋48直播]${ item.userInfo.nickname }_${ item.liveId }.${ time }.flv`);
      const resInfo: LiveRoomInfo = await requestLiveRoomInfo(item.liveId);
      const worker: Worker = new FFMpegDownloadWorker();

      worker.addEventListener('message', function(event: MessageEvent<MessageEventData>) {
        const { type, error }: MessageEventData = event.data;

        if (type === 'close' || type === 'error') {
          if (type === 'error') {
            message.error(`视频：${ item.title } 下载失败！`);
          }

          worker.terminate();
          dispatch(setDeleteLiveChildList(item));
        }
      }, false);

      worker.postMessage({
        type: 'start',
        playStreamPath: resInfo.content.playStreamPath,
        filePath,
        ffmpeg: getFFmpeg()
      });

      dispatch(setAddLiveChildList({
        id: item.liveId,
        worker
      }));
    }
  }
}

export default autoGrab;