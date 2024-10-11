'use idle';

import * as path from 'node:path';
import { promises as fsP } from 'node:fs';
import { randomUUID } from 'node:crypto';
import type { Store } from '@reduxjs/toolkit';
import type { MessageInstance } from 'antd/es/message/interface';
import * as dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { requestLiveList, requestLiveRoomInfo, type LiveData, type LiveInfo, type UserInfo, type LiveRoomInfo } from '@48tools-api/48';
import getPocket48LiveDownloadWorker from './Pocket48LiveDownload.worker/getPocket48LiveDownloadWorker';
import getDownloadAndTranscodingWorker from './DownloadAndTranscodingWorker/getDownloadAndTranscodingWorker';
import { store } from '../../../../store/store';
import { setLiveList, setDeleteLiveChildList, setAddLiveChildList, type Pocket48InitialState } from '../../reducers/pocket48';
import { getFFmpeg, fileTimeFormat, getFilePath } from '../../../../utils/utils';
import Pocket48LiveRender from '../function/Pocket48LiveRender';
import type { MessageEventData, LiveStatusEventData, WebWorkerChildItem } from '../../../../commonTypes';

interface DownloadArgs {
  messageApi: MessageInstance;
  transcoding: boolean | undefined;
  item: LiveInfo;
  resInfo: LiveRoomInfo;
  filePath: string;
}

function downloadBackup(args: Pick<DownloadArgs, 'item' | 'resInfo' | 'filePath'>): void {
  const { dispatch }: Store = store;
  const { item, resInfo, filePath }: Pick<DownloadArgs, 'item' | 'resInfo' | 'filePath'> = args;
  const worker: Pocket48LiveRender = new Pocket48LiveRender({
    id: randomUUID(),
    liveId: item.liveId,
    roomId: resInfo.content.roomId,
    playStreamPath: resInfo.content.playStreamPath,
    filePath,
    ffmpeg: getFFmpeg(),
    onClose(id: string): void {
      dispatch(setDeleteLiveChildList(item));
    }
  });

  dispatch(setAddLiveChildList({
    id: item.liveId,
    worker
  }));
}

function download(args: DownloadArgs): void {
  const { dispatch }: Store = store;
  const { messageApi, transcoding, item, resInfo, filePath }: DownloadArgs = args;
  const worker: Worker = transcoding ? getDownloadAndTranscodingWorker() : getPocket48LiveDownloadWorker();

  worker.addEventListener('message', function(event: MessageEvent<MessageEventData | LiveStatusEventData>): void {
    const { type }: MessageEventData | LiveStatusEventData = event.data;

    if (type === 'close' || type === 'error') {
      if (type === 'error') {
        messageApi.error(`视频：${ item.title } 下载失败！`);
      }

      worker.terminate();
      dispatch(setDeleteLiveChildList(item));
    }
  }, false);

  worker.postMessage({
    type: 'start',
    playStreamPath: resInfo.content.playStreamPath,
    filePath,
    ffmpeg: getFFmpeg(),
    liveId: item.liveId,
    roomId: resInfo.content.roomId
  });

  dispatch(setAddLiveChildList({
    id: item.liveId,
    worker
  }));
}

/**
 * 自动抓取
 * @param { MessageInstance } messageApi
 * @param { string } dir - 保存录像的目录
 * @param { Array<string> } usersArr - 监听的小偶像
 * @param { boolean | undefined } transcoding - 自动转码
 * @param { boolean | undefined } backup - 备用下载
 */
async function autoGrab(
  messageApi: MessageInstance,
  dir: string,
  usersArr: string[],
  transcoding: boolean | undefined,
  backup: boolean | undefined
): Promise<void> {
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
        filename: string = getFilePath({
          typeTitle: '口袋48直播(自动录制)',
          infoArray: [item.userInfo.nickname, item.liveId, cTime],
          timeString: rTime,
          ext: transcoding ? 'ts' : 'flv'
        }); // 文件名

      try {
        // 追加log
        const log: string = path.join(dir, 'pocket48_live_log.txt');
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

      if (backup) {
        downloadBackup({ item, resInfo, filePath });
      } else {
        download({ messageApi, transcoding, item, resInfo, filePath });
      }
    }
  }
}

export default autoGrab;