import { randomUUID } from 'crypto';
import type { SaveDialogReturnValue } from 'electron';
import { dialog } from '@electron/remote';
import { useState, ReactElement, ReactNodeArray, Dispatch as D, SetStateAction as S, MouseEvent } from 'react';
import type { Dispatch } from 'redux';
import { useDispatch } from 'react-redux';
import { Form, Select, message, Button, Space } from 'antd';
import type { FormInstance } from 'antd/es/form';
import * as filenamify from 'filenamify';
import FFMpegDownloadWorker from 'worker-loader!../../../../utils/worker/FFMpegDownload.worker';
import style from './getLiveUrl.sass';
import { parseInLive, parseLiveUrl } from '../parseLive48Website';
import autoInLiveTimer from './autoInLiveTimer';
import { setAddInLiveList, setStopInLiveList } from '../../reducers/live48';
import { getFFmpeg, getFileTime } from '../../../../utils/utils';
import type { MessageEventData } from '../../../../types';
import type { InLiveFormValue } from '../../types';

/* 抓取直播信息表单 */
function GetLiveUrl(props: {}): ReactElement {
  const dispatch: Dispatch = useDispatch();
  const [form]: [FormInstance] = Form.useForm();
  const [liveUrlInfo, setLiveUrlInfo]: [
    Array<{ label: string; value: string }>,
    D<S<Array<{ label: string; value: string }>>>
  ] = useState([]);
  const [loading, setLoading]: [boolean, D<S<boolean>>] = useState(false); // 获取直播地址时的loading状态

  // 开始直播录制
  async function handleStartInLiveSubmit(value: InLiveFormValue): Promise<void> {
    if (!value.type || !value.live) {
      return message.warn('请选择直播！');
    }

    const liveUrl: { url: string; title: string } | null = await parseLiveUrl(value.live, value.quality);

    if (!liveUrl) {
      return message.warn('当前直播未开始！');
    }

    // 开始录制
    const time: string = getFileTime();
    const result: SaveDialogReturnValue = await dialog.showSaveDialog({
      defaultPath: `[48公演直播]${ value.type }_${ filenamify(liveUrl.title) }_${ value.live }_${ value.quality }_${ time }.flv`
    });

    if (result.canceled || !result.filePath) return;

    const id: string = randomUUID();
    const worker: Worker = new FFMpegDownloadWorker();

    worker.addEventListener('message', function(event: MessageEvent<MessageEventData>) {
      const { type, error }: MessageEventData = event.data;

      if (type === 'close' || type === 'error') {
        if (type === 'error') {
          message.error(`${ value.type }直播下载失败！`);
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

    dispatch(setAddInLiveList({ id, worker, ...value }));
  }

  // 自动录制
  async function handleAutoInLiveClick(event: MouseEvent<HTMLButtonElement>): Promise<void> {
    let value: InLiveFormValue;

    try {
      value = await form.validateFields();
    } catch {
      return;
    }

    if (!value.type || !value.live) {
      return message.warn('请选择直播！');
    }

    // 开始监听
    const id: string = randomUUID();
    const time: string = getFileTime();
    const result: SaveDialogReturnValue = await dialog.showSaveDialog({
      defaultPath: `[48公演直播]${ value.type }_${ id }_${ value.live }_${ value.quality }_${ time }.flv`
    });

    if (result.canceled || !result.filePath) return;

    // 开始轮询
    await autoInLiveTimer(id, value, result.filePath);

    const timer: NodeJS.Timeout = setInterval(autoInLiveTimer, 120_000, id, value, result.filePath);

    dispatch(setAddInLiveList({ id, timer, ...value }));
  }

  // 选择团体后获取公演直播信息
  async function handleLiveTypeSelect(value: string): Promise<void> {
    setLoading(true);

    try {
      const liveInfo: Array<{ label: string; value: string }> = await parseInLive(value);

      setLiveUrlInfo(liveInfo);
      form.resetFields(['live']);

      if (liveInfo.length === 0) {
        message.warn('当前没有公演！');
      }
    } catch (err) {
      console.error(err);
      message.error('获取公演信息失败！');
    }

    setLoading(false);
  }

  // 渲染公演的选择
  function liveSelectOptionRender(): ReactNodeArray {
    return liveUrlInfo.map((item: { label: string; value: string }, index: number): ReactElement => {
      return <Select.Option key={ item.value } value={ item.value }>{ item.label }</Select.Option>;
    });
  }

  return (
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
      <Button.Group className={ style.marginLeft16 }>
        <Button type="primary" htmlType="submit">开始直播录制</Button>
        <Button onClick={ handleAutoInLiveClick }>自动录制</Button>
      </Button.Group>
    </Form>
  );
}

export default GetLiveUrl;