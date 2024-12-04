import type { SaveDialogReturnValue } from 'electron';
import { Fragment, type ReactElement, type ReactNode, type MouseEvent } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { createStructuredSelector, type Selector } from 'reselect';
import { Table, Select, Button, message, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { DefaultOptionType } from 'rc-select/es/Select';
import type { UseMessageReturnType } from '@48tools-types/antd';
import { LoadingOutlined as IconLoadingOutlined } from '@ant-design/icons';
import { showSaveDialog } from '../../../utils/remote/dialog';
import getFFmpegDownloadWorker from '../../../utils/worker/FFmpegDownload.worker/getFFmpegDownloadWorker';
import Header from '../../../components/Header/Header';
import AcFunLogin from '../../../functionalComponents/AcFunLogin/AcFunLogin';
import AddForm, { acfunVideoTypesMap } from './AddForm';
import {
  setDeleteDownloadList,
  setAddDownloadWorker,
  setDeleteDownloadWorker,
  setDownloadProgress,
  setRepresentation,
  type AcFunDownloadInitialState
} from '../reducers/acfunDownload';
import { getFFmpeg, getFilePath } from '../../../utils/utils';
import { ProgressNative, type ProgressSet } from '../../../components/ProgressNative/index';
import { parseAcFunUrl, type ParseAcFunUrlResult } from './function/parseAcFunUrl';
import { pick } from '../../../utils/lodash';
import type { WebWorkerChildItem } from '../../../commonTypes';
import type { DownloadItem, Representation } from '../types';
import type { MessageEventData } from '../../../utils/worker/FFmpegDownload.worker/FFmpegDownload.worker';

/* redux selector */
type RState = { acfunDownload: AcFunDownloadInitialState };

const selector: Selector<RState, AcFunDownloadInitialState> = createStructuredSelector({
  // 下载任务列表
  downloadList: ({ acfunDownload }: RState): Array<DownloadItem> => acfunDownload.downloadList,

  // 正在下载的线程
  ffmpegDownloadWorkers: ({ acfunDownload }: RState): Array<WebWorkerChildItem> => acfunDownload.ffmpegDownloadWorkers,

  // 进度条列表
  progress: ({ acfunDownload }: RState): Record<string, ProgressSet> => acfunDownload.progress
});

/* A站视频下载 */
function Download(props: {}): ReactElement {
  const { downloadList, ffmpegDownloadWorkers, progress }: AcFunDownloadInitialState = useSelector(selector);
  const dispatch: Dispatch = useDispatch();
  const [messageApi, messageContextHolder]: UseMessageReturnType = message.useMessage();

  // 下拉
  async function handleLoadDataDropdownVisibleChange(record: DownloadItem, open: boolean): Promise<void> {
    try {
      const { representation }: ParseAcFunUrlResult = await parseAcFunUrl(record.type, record.id);

      if (representation) {
        dispatch(setRepresentation({
          qid: record.qid,
          representation: representation.map((o: Representation): Representation => pick(o, ['m3u8Slice', 'url', 'qualityLabel']))
        }));
      } else {
        messageApi.warning('没有获取到媒体地址！');
      }

    } catch (err) {
      console.error(err);
      messageApi.error('地址解析失败！');
    }
  }

  // 停止
  function handleStopClick(record: DownloadItem, event?: MouseEvent): void {
    const index: number = ffmpegDownloadWorkers.findIndex((o: WebWorkerChildItem): boolean => o.id === record.qid);

    if (index >= 0) {
      ffmpegDownloadWorkers[index].worker.postMessage({ type: 'stop' });
    }
  }

  // 开始下载
  async function handleDownloadAcFunVideoClick(record: DownloadItem, value: string): Promise<void> {
    const [label, durl]: string[] = value.split(/@/);
    const result: SaveDialogReturnValue = await showSaveDialog({
      defaultPath: getFilePath({
        typeTitle: 'A站视频下载',
        infoArray: [`${ record.type }${ record.id }`, label],
        ext: 'mp4'
      })
    });

    if (result.canceled || !result.filePath) return;

    let requestIdleID: number | null = null;
    const worker: Worker = getFFmpegDownloadWorker();

    worker.addEventListener('message', function(event: MessageEvent<MessageEventData>) {
      const { type }: MessageEventData = event.data;

      if (type === 'progress') {
        requestIdleID !== null && cancelIdleCallback(requestIdleID);
        requestIdleID = requestIdleCallback((): void => {
          dispatch(setDownloadProgress(event.data));
        });
      }

      if (type === 'close' || type === 'error') {
        requestIdleID !== null && cancelIdleCallback(requestIdleID);

        if (type === 'error') {
          messageApi.error(`[${ record.type }${ record.id }]下载失败！`);
        }

        worker.terminate();
        dispatch(setDeleteDownloadWorker(record));
      }
    }, false);

    worker.postMessage({
      type: 'start',
      playStreamPath: durl,
      filePath: result.filePath,
      ffmpeg: getFFmpeg(),
      qid: record.qid
    });

    dispatch(setAddDownloadWorker({
      id: record.qid,
      worker
    }));
  }

  // 删除一个下载队列
  function handleDeleteDownloadItemClick(record: DownloadItem, event: MouseEvent): void {
    dispatch(setDeleteDownloadList(record));
  }

  // 渲染下载
  function downloadQualitySelectOptions(representation: Array<Representation>): Array<DefaultOptionType> {
    return representation.map((item: Representation, index: number): DefaultOptionType => {
      return {
        label: item.qualityLabel,
        value: `${ item.qualityLabel }@${ item.url }`
      };
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
      title: '下载进度',
      dataIndex: 'qid',
      render: (value: string, record: DownloadItem, index: number): ReactNode => {
        const inDownload: boolean = Object.hasOwn(progress, value);

        if (inDownload) {
          return <ProgressNative progressSet={ progress[value] } />;
        } else {
          return '等待下载';
        }
      }
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
                  onConfirm={ (event?: MouseEvent): void => handleStopClick(record, event) }
                >
                  <Button type="primary" danger={ true }>停止下载</Button>
                </Popconfirm>
              ) : (
                <Select className="!w-[150px]"
                  placeholder="下载"
                  options={ record.representation ? downloadQualitySelectOptions(record.representation) : [] }
                  notFoundContent={
                    record.representation ? undefined : (
                      <div className="text-center py-[8px]">
                        <IconLoadingOutlined className="mr-[6px]" />
                        地址加载中...
                      </div>
                    )
                  }
                  onSelect={ (val: string): Promise<void> => handleDownloadAcFunVideoClick(record, val) }
                  onDropdownVisibleChange={
                    record.representation
                      ? undefined
                      : (open: boolean): Promise<void> => handleLoadDataDropdownVisibleChange(record, open)
                  }
                />
              )
            }
            <Button type="primary"
              danger={ true }
              disabled={ inDownload }
              onClick={ (event: MouseEvent): void => handleDeleteDownloadItemClick(record, event) }
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
      { messageContextHolder }
    </Fragment>
  );
}

export default Download;