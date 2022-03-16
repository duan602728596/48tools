import * as path from 'node:path';
import { promises as fsP } from 'node:fs';
import type { Store } from '@reduxjs/toolkit';
import { message } from 'antd';
import * as dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import getFFMpegDownloadWorker from '../../../../utils/worker/getFFMpegDownloadWorker';
import getDownloadAndTranscodingWorker from './DownloadAndTranscodingWorker/getDownloadAndTranscodingWorker';
import { store } from '../../../../store/store';
import { setLiveList, setDeleteLiveChildList, setAddLiveChildList, type Pocket48InitialState } from '../../reducers/pocket48';
import { requestLiveList, requestLiveRoomInfo } from '../../services/pocket48';
import { getFFmpeg, fileTimeFormat } from '../../../../utils/utils';
import type { MessageEventData, WebWorkerChildItem } from '../../../../types';
import type { LiveData, LiveInfo, UserInfo, LiveRoomInfo } from '../../services/interface';

/**
 * 自动抓取
 * @param { string } dir: 保存录像的目录
 * @param { Array<string> } usersArr: 监听的小偶像
 * @param { boolean } transcoding: 自动转码
 */
async function autoGrab(dir: string, usersArr: string[], transcoding: boolean): Promise<void> {
  const { dispatch, getState }: Store = store;
  const res: LiveData = await requestLiveList('0', true);
  const liveList: Array<LiveInfo> = res.content.liveList; // 自动刷新获取直播列表

  dispatch(setLiveList(liveList));

  // 过滤，只保留xox信息
  const humanRegExp: RegExp = new RegExp(`(${ usersArr.join('|') })`, 'i'); // 正则
  const { liveChildList }: Pocket48InitialState = getState().pocket48;

  for (const item of liveList) {
    const { userId, nickname }: UserInfo = item.userInfo;
    const index: number = liveChildList.findIndex((o: WebWorkerChildItem): boolean => o.id === item.liveId);

    // 正则匹配或者id完全匹配
    if ((humanRegExp.test(nickname) || usersArr.includes[userId]) && index < 0) {
      const cTimeDay: Dayjs = dayjs(Number(item.ctime)),
        cTime: string = cTimeDay.format(fileTimeFormat), // 直播开始时间
        rTimeDay: Dayjs = dayjs(),
        rTime: string = rTimeDay.format(fileTimeFormat), // 文件创建时间
        filename: string = `[口袋48直播]${ item.userInfo.nickname }_${ cTime }_${ item.liveId }_${ rTime }`
          + `.${ transcoding ? 'ts' : 'flv' }`; // 文件名

      try {
        // 追加log
        const log: string = path.join(dir, 'log.txt');
        const logData: string = `直播标题：${ item.title }
直播ID：${ item.liveId }
直播人：${ item.userInfo.nickname }
直播时间：${ cTimeDay.format('YYYY-MM-DD HH:mm:ss') }
输出文件：${ filename }
创建时间：${ rTimeDay.format('YYYY-MM-DD HH:mm:ss') }\n\n`;

        await fsP.writeFile(log, logData, { encoding: 'utf8', flag: 'a' });
      } catch (err) {
        console.error(err);
      }

      const filePath: string = path.join(dir, filename);
      const resInfo: LiveRoomInfo = await requestLiveRoomInfo(item.liveId);
      const worker: Worker = transcoding ? getDownloadAndTranscodingWorker() : getFFMpegDownloadWorker();

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