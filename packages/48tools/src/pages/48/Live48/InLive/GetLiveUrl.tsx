import { randomUUID } from 'node:crypto';
import type { SaveDialogReturnValue } from 'electron';
import {
  Fragment,
  useState,
  useEffect,
  type ReactElement,
  type Dispatch as D,
  type SetStateAction as S
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { createStructuredSelector, type Selector } from 'reselect';
import { Form, Select, message, Button, type FormInstance } from 'antd';
import type { DefaultOptionType } from 'rc-select/es/Select';
import type { UseMessageReturnType } from '@48tools-types/antd';
import filenamify from 'filenamify/browser';
import {
  requestOpenLiveList,
  requestLiveOne,
  type OpenLiveList,
  type OpenLiveInfo,
  type LiveOne,
  type LiveOnePlayStreams
} from '@48tools-api/48';
import commonStyle from '../../../../common.sass';
import style from './getLiveUrl.sass';
import { showSaveDialog } from '../../../../utils/remote/dialog';
import getFFmpegDownloadWorker from '../../../../utils/worker/FFmpegDownload.worker/getFFmpegDownloadWorker';
import { setOpenLiveListOptions, setAddInLiveList, setStopInLiveList, type Live48InitialState } from '../../reducers/live48';
import { getFFmpeg, getFileTime } from '../../../../utils/utils';
import type { MessageEventData } from '../../../../commonTypes';
import type { InLiveFormValue, InLiveWebWorkerItemNoplayStreamPath } from '../../types';

/* redux selector */
type RSelector = Pick<Live48InitialState, 'OpenLiveListOptions'>;
type RState = { live48: Live48InitialState };

const selector: Selector<RState, RSelector> = createStructuredSelector({
  // 公演直播列表
  OpenLiveListOptions: ({ live48 }: RState): Array<DefaultOptionType> => live48.OpenLiveListOptions
});

/* 抓取直播信息表单 */
function GetLiveUrl(props: {}): ReactElement {
  const { OpenLiveListOptions }: RSelector = useSelector(selector);
  const dispatch: Dispatch = useDispatch();
  const [messageApi, messageContextHolder]: UseMessageReturnType = message.useMessage();
  const [form]: [FormInstance] = Form.useForm();
  const [loading, setLoading]: [boolean, D<S<boolean>>] = useState(false); // 获取直播地址时的loading状态

  // 开始直播录制
  async function handleStartInLiveSubmit(value: InLiveFormValue): Promise<void> {
    if (!value.live) {
      messageApi.warning('请选择直播！');

      return;
    }

    const reqLiveOne: LiveOne = await requestLiveOne(value.live);
    const playStream: Array<LiveOnePlayStreams> = reqLiveOne?.content?.playStreams ?? [];

    if (!playStream.length) {
      messageApi.warning('当前直播未开始！');

      return;
    }

    const playStreamItem: LiveOnePlayStreams | undefined = playStream
      .filter((o: LiveOnePlayStreams): boolean => !!o.streamPath)
      .at(-1);

    if (!playStreamItem) {
      messageApi.warning('当前直播未开始！');

      return;
    }

    // 开始录制
    const time: string = getFileTime();
    const result: SaveDialogReturnValue = await showSaveDialog({
      defaultPath: `[48公演直播]${ filenamify(reqLiveOne.content.title) }_${ value.live }_${ time }.flv`
    });

    if (result.canceled || !result.filePath) return;

    const id: string = randomUUID();
    const worker: Worker = getFFmpegDownloadWorker();

    worker.addEventListener('message', function(event: MessageEvent<MessageEventData>) {
      const { type, error }: MessageEventData = event.data;

      if (type === 'close' || type === 'error') {
        if (type === 'error') {
          messageApi.error(`${ value.live }直播下载失败！`);
        }

        worker.terminate();
        dispatch(setStopInLiveList(id));
      }
    }, false);

    worker.postMessage({
      type: 'start',
      playStreamPath: playStreamItem!.streamPath,
      filePath: result.filePath,
      ffmpeg: getFFmpeg()
    });

    dispatch(setAddInLiveList(
      Object.assign<
        Pick<InLiveWebWorkerItemNoplayStreamPath, 'id' | 'worker'>,
        Pick<InLiveWebWorkerItemNoplayStreamPath, 'live' | 'quality'>
      >({ id, worker }, {
        live: value.live,
        quality: playStreamItem!.streamName
      })
    ));
  }

  // 获取直播列表
  async function getLiveList(): Promise<void> {
    setLoading(true);

    try {
      const res: OpenLiveList = await requestOpenLiveList();

      if (res.content.liveList) {
        dispatch(setOpenLiveListOptions(
          res.content.liveList.map((o: OpenLiveInfo): DefaultOptionType => ({
            label: [
              `${ o.title }-${ o.subTitle }</b>`,
              <span key="tips" className={ commonStyle.tips }>{ o.status === 1 ? '（未开始）' : '' }</span>
            ],
            value: o.liveId
          }))
        ));
      }
    } catch (err) {
      console.error(err);
      messageApi.error('获取公演直播列表失败！');
    }

    setLoading(false);
  }

  useEffect(function(): void {
    if (!OpenLiveListOptions.length) {
      getLiveList();
    }
  }, [OpenLiveListOptions]);

  return (
    <Fragment>
      <Form form={ form } initialValues={{ quality: 'chao' }} onFinish={ handleStartInLiveSubmit }>
        <Form.Item name="live" noStyle={ true }>
          <Select className={ style.liveSelect } loading={ loading } placeholder="选择公演" options={ OpenLiveListOptions } />
        </Form.Item>
        <Button.Group className="ml-[8px]">
          <Button type="primary" htmlType="submit">开始直播录制</Button>
          <Button onClick={ getLiveList }>刷新直播公演列表</Button>
        </Button.Group>
      </Form>
      { messageContextHolder }
    </Fragment>
  );
}

export default GetLiveUrl;