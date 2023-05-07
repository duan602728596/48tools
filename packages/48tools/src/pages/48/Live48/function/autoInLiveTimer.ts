import type { Store } from '@reduxjs/toolkit';
import type { MessageInstance } from 'antd/es/message/interface';
import getFFmpegDownloadWorker from '../../../../utils/worker/FFmpeg/getFFmpegDownloadWorker';
import { store } from '../../../../store/store';
import { setAddWorkerInLiveList, setStopInLiveList } from '../../reducers/live48';
import { parseLiveUrl } from './parseLive48Website';
import { getFFmpeg } from '../../../../utils/utils';
import type { InLiveFormValue } from '../../types';
import type { MessageEventData } from '../../../../commonTypes';

/**
 * 监听直播是否开始，并自动录制
 * @param { MessageInstance } messageApi
 * @param { string } id: 当前item的id
 * @param { InLiveFormValue } value: 表单内获取的直播配置
 * @param { string } filePath: 保存地址
 */
async function autoInLiveTimer(messageApi: MessageInstance, id: string, value: InLiveFormValue, filePath: string): Promise<void> {
  const { dispatch }: Store = store;

  const liveUrl: { url: string; title: string } | null = await parseLiveUrl(value.live!, value.quality!);

  if (!liveUrl) return;

  const worker: Worker = getFFmpegDownloadWorker();

  worker.addEventListener('message', function(event: MessageEvent<MessageEventData>) {
    const { type, error }: MessageEventData = event.data;

    if (type === 'close' || type === 'error') {
      if (type === 'error') {
        messageApi.error(`${ value.type }直播下载失败！`);
      }

      worker.terminate();
      dispatch(setStopInLiveList(id));
    }
  }, false);

  worker.postMessage({
    type: 'start',
    playStreamPath: liveUrl.url,
    filePath,
    ffmpeg: getFFmpeg()
  });

  dispatch(setAddWorkerInLiveList({ id, worker }));
}

export default autoInLiveTimer;