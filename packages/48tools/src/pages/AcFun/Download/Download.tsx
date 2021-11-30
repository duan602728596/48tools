import type { SaveDialogReturnValue } from 'electron';
import { dialog } from '@electron/remote';
import { Fragment, type ReactElement, type ReactNode, type MouseEvent } from 'react';
import type { Dispatch } from 'redux';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector, createStructuredSelector, type Selector } from 'reselect';
import { Table, Select, Button, message, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import style from './download.sass';
import getFFMpegDownloadWorker from '../../../utils/worker/getFFMpegDownloadWorker';
import Header from '../../../components/Header/Header';
import AcFunLogin from '../../../components/AcFunLogin/AcFunLogin';
import AddForm, { acfunVideoTypesMap } from './AddForm';
import {
  setDeleteDownloadList,
  setAddDownloadWorker,
  setDeleteDownloadWorker,
  type AcFunDownloadInitialState
} from '../reducers/download';
import { getFFmpeg } from '../../../utils/utils';
import type { MessageEventData, WebWorkerChildItem } from '../../../types';
import type { DownloadItem, Representation } from '../types';

/* redux selector */
const selector: Selector<any, AcFunDownloadInitialState> = createStructuredSelector({
  // 下载任务列表
  downloadList: createSelector(
    ({ acfunDownload }: { acfunDownload: AcFunDownloadInitialState }): Array<DownloadItem> =>
      acfunDownload.downloadList,
    (downloadList: Array<DownloadItem>): Array<DownloadItem> => downloadList
  ),
  // 正在下载的线程
  ffmpegDownloadWorkers: createSelector(
    ({ acfunDownload }: { acfunDownload: AcFunDownloadInitialState }): Array<WebWorkerChildItem> =>
      acfunDownload.ffmpegDownloadWorkers,
    (ffmpegDownloadWorkers: Array<WebWorkerChildItem>): Array<WebWorkerChildItem> => ffmpegDownloadWorkers
  )
});

/* A站视频下载 */
function Download(props: {}): ReactElement {
  const { downloadList, ffmpegDownloadWorkers }: AcFunDownloadInitialState = useSelector(selector);
  const dispatch: Dispatch = useDispatch();

  // 停止
  function handleStopClick(record: DownloadItem, event: MouseEvent<HTMLButtonElement>): void {
    const index: number = ffmpegDownloadWorkers.findIndex((o: WebWorkerChildItem): boolean => o.id === record.qid);

    if (index >= 0) {
      ffmpegDownloadWorkers[index].worker.postMessage({ type: 'stop' });
    }
  }

  // 开始下载
  async function handleDownloadAcFunVideoClick(record: DownloadItem, value: string): Promise<void> {
    const [label, durl]: string[] = value.split(/@/);
    const result: SaveDialogReturnValue = await dialog.showSaveDialog({
      defaultPath: `[A站下载]${ record.type }${ record.id }_${ label }.mp4`
    });

    if (result.canceled || !result.filePath) return;

    try {
      const worker: Worker = getFFMpegDownloadWorker();

      worker.addEventListener('message', function(event: MessageEvent<MessageEventData>) {
        const { type, error }: MessageEventData = event.data;

        if (type === 'close' || type === 'error') {
          if (type === 'error') {
            message.error(`[${ record.type }${ record.id }]下载失败！`);
          }

          worker.terminate();
          dispatch(setDeleteDownloadWorker(record));
        }
      }, false);

      worker.postMessage({
        type: 'start',
        playStreamPath: durl,
        filePath: result.filePath,
        id: record.qid,
        ffmpeg: getFFmpeg()
      });

      dispatch(setAddDownloadWorker({
        id: record.qid,
        worker
      }));
    } catch (err) {
      console.error(err);
      message.error('视频下载失败！');
    }
  }

  // 删除一个下载队列
  function handleDeleteDownloadItemClick(record: DownloadItem, event: MouseEvent<HTMLButtonElement>): void {
    dispatch(setDeleteDownloadList(record));
  }

  // 渲染下载
  function handleDownloadQualitySelectOptionRender(representation: Array<Representation>): Array<ReactNode> {
    return representation.map((item: Representation, index: number): ReactElement => {
      return (
        <Select.Option key={ item.url } value={ `${ item.qualityLabel }@${ item.url }` }>
          { item.qualityLabel }
        </Select.Option>
      );
    });
  }

  const columns: ColumnsType<DownloadItem> = [
    { title: 'ID', dataIndex: 'id' },
    {
      title: '下载类型',
      dataIndex: 'type',
      render: (value: string, record: DownloadItem, index: number): string => acfunVideoTypesMap[value]
    },
    {
      title: '操作',
      key: 'handle',
      width: 245,
      render: (value: undefined, record: DownloadItem, index: number): ReactElement => {
        const idx: number = ffmpegDownloadWorkers.findIndex((o: WebWorkerChildItem): boolean => o.id === record.qid);
        const inDownload: boolean = idx >= 0;

        return (
          <Button.Group>
            {
              inDownload ? (
                <Popconfirm title="确定要停止下载吗？"
                  onConfirm={ (event: MouseEvent<HTMLButtonElement>): void => handleStopClick(record, event) }
                >
                  <Button type="primary" danger={ true }>停止下载</Button>
                </Popconfirm>
              ) : (
                <Select className={ style.downloadSelect }
                  placeholder="下载"
                  onSelect={ (val: string): Promise<void> => handleDownloadAcFunVideoClick(record, val) }
                >
                  { handleDownloadQualitySelectOptionRender(record.representation) }
                </Select>
              )
            }
            <Button type="primary"
              danger={ true }
              disabled={ inDownload }
              onClick={ (event: MouseEvent<HTMLButtonElement>): void => handleDeleteDownloadItemClick(record, event) }
            >
              删除
            </Button>
          </Button.Group>
        );
      }
    }
  ];

  return (
    <Fragment>
      <Header>
        <Button.Group>
          <AcFunLogin />
          <AddForm />
        </Button.Group>
      </Header>
      <Table size="middle"
        columns={ columns }
        dataSource={ downloadList }
        bordered={ true }
        rowKey="qid"
        pagination={{
          showQuickJumper: true
        }}
      />
    </Fragment>
  );
}

export default Download;