import { randomUUID } from 'node:crypto';
import type { SaveDialogReturnValue } from 'electron';
import {
  Fragment,
  useState,
  type ReactElement,
  type ReactNode,
  type Dispatch as D,
  type SetStateAction as S,
  type MouseEvent
} from 'react';
import { useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { Form, Select, message, Button, Space, type FormInstance } from 'antd';
import type { UseMessageReturnType } from '@48tools-types/antd';
import filenamify from 'filenamify/browser';
import style from './getLiveUrl.sass';
import { showSaveDialog } from '../../../../utils/remote/dialog';
import getFFmpegDownloadWorker from '../../../../utils/worker/FFmpeg/getFFmpegDownloadWorker';
import { parseInLive, parseLiveUrl } from '../function/parseLive48Website';
import autoInLiveTimer from '../function/autoInLiveTimer';
import { setAddInLiveList, setStopInLiveList } from '../../reducers/live48';
import { getFFmpeg, getFileTime } from '../../../../utils/utils';
import type { MessageEventData } from '../../../../commonTypes';
import type { InLiveFormValue, InLiveWebWorkerItemNoplayStreamPath } from '../../types';

/* 抓取直播信息表单 */
function GetLiveUrl(props: {}): ReactElement {
  const dispatch: Dispatch = useDispatch();
  const [messageApi, messageContextHolder]: UseMessageReturnType = message.useMessage();
  const [form]: [FormInstance] = Form.useForm();
  const [liveUrlInfo, setLiveUrlInfo]: [
    Array<{ label: string; value: string }>,
    D<S<Array<{ label: string; value: string }>>>
  ] = useState([]);
  const [loading, setLoading]: [boolean, D<S<boolean>>] = useState(false); // 获取直播地址时的loading状态

  // 开始直播录制
  async function handleStartInLiveSubmit(value: InLiveFormValue): Promise<void> {
    if (!value.type || !value.live) {
      messageApi.warning('请选择直播！');

      return;
    }

    const liveUrl: { url: string; title: string } | null = await parseLiveUrl(value.live, value.quality);

    if (!liveUrl) {
      messageApi.warning('当前直播未开始！');

      return;
    }

    // 开始录制
    const time: string = getFileTime();
    const result: SaveDialogReturnValue = await showSaveDialog({
      defaultPath: `[48公演直播]${ value.type }_${ filenamify(liveUrl.title) }_${ value.live }_${ value.quality }_${ time }.flv`
    });

    if (result.canceled || !result.filePath) return;

    const id: string = randomUUID();
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
      filePath: result.filePath,
      ffmpeg: getFFmpeg()
    });

    dispatch(setAddInLiveList(
      Object.assign<
        Pick<InLiveWebWorkerItemNoplayStreamPath, 'id' | 'worker'>,
        Required<InLiveFormValue>
      >({ id, worker }, value as Required<InLiveFormValue>)
    ));
  }

  // 自动录制
  async function handleAutoInLiveClick(event: MouseEvent): Promise<void> {
    let value: InLiveFormValue;

    try {
      value = await form.validateFields();
    } catch {
      return;
    }

    if (!value.type || !value.live) {
      messageApi.warning('请选择直播！');

      return;
    }

    // 开始监听
    const id: string = randomUUID();
    const time: string = getFileTime();
    const result: SaveDialogReturnValue = await showSaveDialog({
      defaultPath: `[48公演直播]${ value.type }_${ id }_${ value.live }_${ value.quality }_${ time }.flv`
    });

    if (result.canceled || !result.filePath) return;

    // 开始轮询
    const timer: NodeJS.Timeout = setInterval(autoInLiveTimer, 120_000, messageApi, id, value, result.filePath);

    dispatch(setAddInLiveList(
      Object.assign<
        Pick<InLiveWebWorkerItemNoplayStreamPath, 'id' | 'timer'>,
        Required<InLiveFormValue>
      >({ id, timer }, value as Required<InLiveFormValue>)
    ));
    setTimeout(autoInLiveTimer, 0, messageApi, id, value, result.filePath);
  }

  // 选择团体后获取公演直播信息
  async function handleLiveTypeSelect(value: string): Promise<void> {
    setLoading(true);

    try {
      const liveInfo: Array<{ label: string; value: string }> = await parseInLive(value);

      setLiveUrlInfo(liveInfo);
      form.resetFields(['live']);

      if (liveInfo.length === 0) {
        messageApi.warning('当前没有公演！');
      }
    } catch (err) {
      console.error(err);
      messageApi.error('获取公演信息失败！');
    }

    setLoading(false);
  }

  // 渲染公演的选择
  function liveSelectOptionRender(): Array<ReactNode> {
    return liveUrlInfo.map((item: { label: string; value: string }, index: number): ReactElement => {
      return <Select.Option key={ item.value } value={ item.value }>{ item.label }</Select.Option>;
    });
  }

  return (
    <Fragment>
      <Form form={ form } initialValues={{ quality: 'chao' }} onFinish={ handleStartInLiveSubmit }>
        <Space size={ 8 }>
          <Form.Item name="type" noStyle={ true }>
            <Select className={ style.typeSelect } placeholder="选择团体" onSelect={ handleLiveTypeSelect }>
              <Select.Option value="snh48">SNH48</Select.Option>
              <Select.Option value="bej48">BEJ48</Select.Option>
              <Select.Option value="gnz48">GNZ48</Select.Option>
              <Select.Option value="ckg48">CKG48</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="live" noStyle={ true }>
            <Select className={ style.liveSelect } loading={ loading } placeholder="选择公演">
              { liveSelectOptionRender() }
            </Select>
          </Form.Item>
          <Form.Item name="quality" noStyle={ true }>
            <Select className={ style.qualitySelect } placeholder="画质">
              <Select.Option value="chao">超清</Select.Option>
              <Select.Option value="gao">高清</Select.Option>
              <Select.Option value="liuchang">流畅</Select.Option>
            </Select>
          </Form.Item>
        </Space>
        <Button.Group className="ml-[16px]">
          <Button type="primary" htmlType="submit">开始直播录制</Button>
          <Button onClick={ handleAutoInLiveClick }>自动录制</Button>
        </Button.Group>
      </Form>
      { messageContextHolder }
    </Fragment>
  );
}

export default GetLiveUrl;