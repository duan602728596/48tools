import type { Store } from '@reduxjs/toolkit';
import { store } from '../../../store/store';
import { requestStreamingUrl, requestShowroomHtml, type StreamingUrl, type StreamingUrlItem } from '@48tools-api/showroom';
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
  let roomId: string = record.roomId;

  try {
    if (!/^\d+$/.test(record.roomId)) {
      const resHtml: string = await requestShowroomHtml(record.roomId);
      const href: string | undefined = /<a[^>]*class="[^"]*st-header__link[^"]*"[^>]*href="([^"]+)"/i.exec(resHtml)?.[1];

      if (href) {
        const url: URL = new URL(href, 'https://www.showroom-live.com');
        const _roomId: string | null = url.searchParams.get('room_id');

        _roomId && (roomId = _roomId);
      }
    }

    const res: StreamingUrl = await requestStreamingUrl(roomId);

    if (!res?.streaming_url_list?.length) {
      messageApi && messageApi.error('获取直播地址失败！');

      return;
    }

    const streamingUrlList: Array<StreamingUrlItem> = res.streaming_url_list.filter((o: StreamingUrlItem): boolean => o.type !== 'webrtc');

    streamingUrlList.sort((a: StreamingUrlItem, b: StreamingUrlItem): number => ((b.quality || 0) - (a.quality || 0)));

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
      playStreamPath: streamingUrlList[0].url,
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