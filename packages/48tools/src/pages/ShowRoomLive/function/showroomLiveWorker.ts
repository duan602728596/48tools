import type { Store } from '@reduxjs/toolkit';
import { store } from '../../../store/store';
import { requestStreamingUrl, type StreamingUrl, type StreamingUrlItem } from '@48tools-api/showroom';
import getFFmpegDownloadWorker from '../../../utils/worker/FFmpegDownload.worker/getFFmpegDownloadWorker';
import { setAddWorkerItem, setRemoveWorkerItem } from '../reducers/showroomLive';
import { getFFmpeg } from '../../../utils/utils';
import type { MessageInstance } from 'antd/es/message/interface';
import type { LiveItem, MessageEventData } from '../../../commonTypes';

/**
 * 创建showroom直播worker的逻辑封装
 * @param { LiveItem } record
 * @param { MessageInstance | undefined } messageApi - 是否显示消息
 * @param { string | undefined } filePath - 文件路径
 */
async function showroomLiveWorker(record: LiveItem, messageApi: MessageInstance | undefined, filePath: string | undefined): Promise<void> {
  const { dispatch }: Store = store;

  try {
    const res: StreamingUrl = await requestStreamingUrl(record.roomId);

    if (!res?.streaming_url_list?.length) {
      messageApi && messageApi.error('获取直播地址失败！');

      return;
    }

    res.streaming_url_list.sort((a: StreamingUrlItem, b: StreamingUrlItem): number => ((b.quality || 0) - (a.quality || 0)));

    const worker: Worker = getFFmpegDownloadWorker();

    worker.addEventListener('message', function(e: MessageEvent<MessageEventData>) {
      const { type, error }: MessageEventData = e.data;

      if (type === 'close' || type === 'error') {
        if (type === 'error') {
          messageApi && messageApi.error(`${ record.description }[${ record.roomId }]录制失败！`);
        }

        worker.terminate();
        dispatch(setRemoveWorkerItem(record.id));
      }
    }, false);

    worker.postMessage({
      type: 'start',
      playStreamPath: res.streaming_url_list[0].url,
      filePath,
      id: record.id,
      ffmpeg: getFFmpeg(),
      protocolWhitelist: true
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

export default showroomLiveWorker;