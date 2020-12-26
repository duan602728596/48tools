import { remote, SaveDialogReturnValue } from 'electron';
import { useState, ReactElement, ReactNodeArray, Dispatch as D, SetStateAction as S } from 'react';
import type { Dispatch } from 'redux';
import { useDispatch } from 'react-redux';
import { Form, Select, message, Button } from 'antd';
import type { FormInstance } from 'antd/es/form';
import * as moment from 'moment';
import FFMpegDownloadWorker from 'worker-loader!../../../utils/worker/FFMpegDownload.Worker';
import type { MessageEventData } from '../../../utils/worker/FFMpegDownload.Worker';
import style from './getLiveUrl.sass';
import { parseInLive, parseLiveUrl } from './parseLive48Website';
import { setAddInLiveList, setStopInLiveList, setDeleteInLiveList } from '../reducers/live48';
import { getFFmpeg, rStr } from '../../../utils/utils';

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
  async function handleStartInLiveSubmit(value: { type?: string; live?: string; quality: string }): Promise<void> {
    if (!value.type || !value.live) {
      return message.warn('请选择直播！');
    }

    const liveUrl: string | null = await parseLiveUrl(value.live, value.quality);

    if (!liveUrl) {
      return message.warn('当前直播未开始！');
    }

    // 开始录制
    const time: string = moment().format('YYYY_MM_DD_HH_mm_ss');
    const result: SaveDialogReturnValue = await remote.dialog.showSaveDialog({
      defaultPath: `[公演直播]${ value.type }.${ value.live }.${ value.quality }.${ time }.flv`
    });

    if (result.canceled || !result.filePath) return;

    const id: string = rStr(30);
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
      playStreamPath: liveUrl,
      filePath: result.filePath,
      ffmpeg: getFFmpeg()
    });

    dispatch(setAddInLiveList({ id, worker, ...value }));
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
      <Form.Item name="type" noStyle={ true }>
        <Select className={ style.typeSelect } placeholder="选择团体" onSelect={ handleLiveTypeSelect }>
          <Select.Option value="snh48">SNH48</Select.Option>
          <Select.Option value="bej48">BEJ48</Select.Option>
          <Select.Option value="gnz48">GNZ48</Select.Option>
          <Select.Option value="ckg48">CKG48</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item name="live" noStyle={ true }>
        <Select className={ style.liveSelect } loading={ loading } placeholder="选择公演">{ liveSelectOptionRender() }</Select>
      </Form.Item>
      <Form.Item name="quality" noStyle={ true }>
        <Select className={ style.qualitySelect } placeholder="画质">
          <Select.Option value="chao">超清</Select.Option>
          <Select.Option value="gao">高清</Select.Option>
          <Select.Option value="liuchang">流畅</Select.Option>
        </Select>
      </Form.Item>
      <Button className={ style.startBtn } type="primary" htmlType="submit">开始直播录制</Button>
    </Form>
  );
}

export default GetLiveUrl;