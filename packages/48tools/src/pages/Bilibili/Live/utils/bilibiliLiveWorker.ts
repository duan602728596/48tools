import type { SaveDialogReturnValue } from 'electron';
import type { Store } from '@reduxjs/toolkit';
import type { MessageInstance } from 'antd/es/message/interface';
import { store } from '../../../../store/store';
import { showSaveDialog } from '../../../../utils/remote/dialog';
import { ffmpegHeaders, isCNCdnHost } from './helper';
import getFFmpegDownloadWorker from '../../../../utils/worker/FFmpegDownload.worker/getFFmpegDownloadWorker';
import { setAddWorkerItem, setRemoveWorkerItem } from '../../reducers/bilibiliLive';
import { getFFmpeg, getFilePath } from '../../../../utils/utils';
import { BilibiliScrapy, BilibiliVideoType } from '../../../../scrapy/bilibili/BilibiliScrapy';
import type { LiveItem, MessageEventData } from '../../../../commonTypes';

/**
 * 创建bilibili直播worker的逻辑封装
 * @param { LiveItem } record
 * @param { MessageInstance | undefined } messageApi - 是否显示消息
 * @param { string | undefined } filePath - 文件路径
 */
async function bilibiliLiveWorker(record: LiveItem, messageApi: MessageInstance | undefined, filePath: string | undefined): Promise<void> {
  const { dispatch }: Store = store;

  try {
    const bilibiliScrapy: BilibiliScrapy = new BilibiliScrapy({
      type: BilibiliVideoType.LIVE,
      id: record.roomId
    });

    await bilibiliScrapy.parse();

    if (bilibiliScrapy.error) {
      messageApi && messageApi[bilibiliScrapy.error.level](bilibiliScrapy.error.message);

      return;
    }

    let liveFilePath: string;

    if (filePath) {
      liveFilePath = filePath;
    } else {
      const result: SaveDialogReturnValue = await showSaveDialog({
        defaultPath: getFilePath({
          typeTitle: 'B站直播',
          infoArray: [record.roomId, record.description, bilibiliScrapy.title, bilibiliScrapy.videoResult[0].videoInfo[0].qualityDescription],
          ext: 'flv'
        })
      });

      if (result.canceled || !result.filePath) return;

      liveFilePath = result.filePath;
    }

    const playStreamPath: string = bilibiliScrapy.videoResult[0].videoInfo[0].videoUrl;
    const worker: Worker = getFFmpegDownloadWorker();
    const isCN: boolean = isCNCdnHost(playStreamPath);

    worker.addEventListener('message', function(event1: MessageEvent<MessageEventData>): void {
      const { type, error }: MessageEventData = event1.data;

      if (type === 'close' || type === 'error') {
        if (type === 'error') {
          messageApi && messageApi.error(`${ record.description }[${ record.roomId }]录制失败！`);
          console.error(error);
        }

        worker.terminate();
        dispatch(setRemoveWorkerItem(record.id));
      }
    }, false);

    worker.postMessage({
      type: 'start',
      playStreamPath,
      filePath: liveFilePath,
      ffmpeg: getFFmpeg(),
      ua: isCN,
      ffmpegHeaders: isCN ? ffmpegHeaders() : undefined,
      noDurationFilesize: true
    });

    dispatch(setAddWorkerItem({
      id: record.id,
      worker
    }));
  } catch (err) {
    console.error(err);
    messageApi && messageApi.error('录制失败！');
  }
}

export default bilibiliLiveWorker;