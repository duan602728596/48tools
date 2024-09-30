'use idle';

import { randomUUID } from 'node:crypto';
import type { SaveDialogReturnValue } from 'electron';
import { Fragment, useEffect, useTransition, type ReactElement, type TransitionStartFunction } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { createStructuredSelector, type Selector } from 'reselect';
import { Form, Select, message, Button, Space, Tooltip, Radio, type FormInstance } from 'antd';
import type { DefaultOptionType } from 'rc-select/es/Select';
import type { UseMessageReturnType } from '@48tools-types/antd';
import { ReloadOutlined as IconReloadOutlined } from '@ant-design/icons';
import filenamify from 'filenamify/browser';
import classNames from 'classnames';
import {
  requestOpenLiveList,
  requestLiveOne,
  requestLiveStream,
  type OpenLiveList,
  type OpenLiveInfo,
  type LiveOne,
  type LiveStream,
  type LiveOnePlayStreams
} from '@48tools-api/48';
import { PlayStreamName } from '@48tools-api/48/enum';
import commonStyle from '../../../../common.sass';
import style from './getLiveUrl.sass';
import { showSaveDialog } from '../../../../utils/remote/dialog';
import getFFmpegDownloadWorker from '../../../../utils/worker/FFmpegDownload.worker/getFFmpegDownloadWorker';
import { setOpenLiveListOptions, setAddInLiveList, setStopInLiveList, type Live48InitialState } from '../../reducers/live48';
import { getFFmpeg, getFileTime } from '../../../../utils/utils';
import { getPocket48Token } from '../../../../utils/snh48';
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
  const [getLiveListLoading, startGetLiveListStartTransition]: [boolean, TransitionStartFunction] = useTransition(); // 获取直播地址时的loading状态

  // 开始直播录制
  async function handleStartInLiveSubmit(value: InLiveFormValue): Promise<void> {
    if (!value.live) {
      messageApi.warning('请选择直播！');

      return;
    }

    const token: string | undefined = getPocket48Token();
    const resLiveOne: LiveOne = await requestLiveOne(value.live, token);
    const playStream: Array<LiveOnePlayStreams> = resLiveOne?.content?.playStreams ?? [];

    if (!playStream.length) {
      messageApi.warning('当前直播未开始！');

      return;
    }

    const playStreamItem: LiveOnePlayStreams | undefined = playStream.find((o: LiveOnePlayStreams): boolean => o.streamName === value.streamName);

    if (!playStreamItem) {
      messageApi.error('未找到流信息！');

      return;
    }

    let streamPath: string;

    if (playStreamItem.vipShow) {
      const resStreamPath: LiveStream = await requestLiveStream(value.live, token);

      if (!resStreamPath.content) {
        // rtmp://cyflv.48.cn/chaoqing/9999?wsSecret=af170e44259cb3b0bc3e63fbb2bb2b84&wsTime=66055829&keeptime=60
        messageApi.warning(resStreamPath.message ?? '当前直播分辨率需要VIP！');

        return;
      } else {
        streamPath = resStreamPath.content;
      }
    } else {
      if (!playStreamItem.streamPath) {
        messageApi.warning('当前直播未开始！');

        return;
      } else {
        streamPath = playStreamItem.streamPath;
      }
    }

    // 开始录制
    const time: string = getFileTime();
    const result: SaveDialogReturnValue = await showSaveDialog({
      defaultPath: `[48公演直播]${ filenamify(resLiveOne.content.title) }_${ value.live }_${ value.streamName }_${ time }.flv`
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
      playStreamPath: streamPath,
      filePath: result.filePath,
      ffmpeg: getFFmpeg()
    });

    dispatch(setAddInLiveList(
      Object.assign<
        Pick<InLiveWebWorkerItemNoplayStreamPath, 'id' | 'worker'>,
        Pick<InLiveWebWorkerItemNoplayStreamPath, 'live' | 'quality'>
      >({ id, worker }, {
        live: value.live,
        quality: playStreamItem.streamName
      })
    ));
  }

  // 获取直播列表
  function getLiveList(): void {
    startGetLiveListStartTransition(async (): Promise<void> => {
      try {
        const res: OpenLiveList = await requestOpenLiveList();

        if (res.content.liveList) {
          dispatch(setOpenLiveListOptions(
            res.content.liveList.map((o: OpenLiveInfo): DefaultOptionType => {
              const title: string = `${ o.title }-${ o.subTitle }`;

              return {
                label: (
                  <div title={ title }>
                    { o.status === 1 ? <span className={ classNames('mr-[4px]', commonStyle.tips) }>[未开始]</span> : null }
                    { title }
                  </div>
                ),
                value: o.liveId
              };
            })
          ));
        } else {
          messageApi.error('获取公演直播列表失败！需要登录账号！');
        }
      } catch (err) {
        console.error(err);
        messageApi.error('获取公演直播列表失败！');
      }
    });
  }

  useEffect(function(): void {
    if (!OpenLiveListOptions.length) {
      getLiveList();
    }
  }, [OpenLiveListOptions]);

  return (
    <Fragment>
      <Form form={ form } initialValues={{ streamName: PlayStreamName.HD }} onFinish={ handleStartInLiveSubmit }>
        <Space size={ 0 }>
          <Form.Item name="streamName" noStyle={ true }>
            <Radio.Group className="mr-[6px]"
              optionType="button"
              buttonStyle="solid"
              options={ [
                PlayStreamName.SD,
                PlayStreamName.HD,
                {
                  label: <span className={ commonStyle.tips }>{ PlayStreamName.FHD }（VIP）</span>,
                  value: PlayStreamName.FHD
                }
              ] } />
          </Form.Item>
          <Form.Item name="live" noStyle={ true }>
            <Select className={ style.liveSelect } loading={ getLiveListLoading } placeholder="选择公演" options={ OpenLiveListOptions } />
          </Form.Item>
          <Tooltip title="刷新公演直播列表">
            <Button className={ style.reloadButton } icon={ <IconReloadOutlined /> } onClick={ getLiveList } />
          </Tooltip>
        </Space>
        <Button className="ml-[8px]" type="primary" htmlType="submit">开始直播录制</Button>
      </Form>
      { messageContextHolder }
    </Fragment>
  );
}

export default GetLiveUrl;