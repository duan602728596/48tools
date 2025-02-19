import * as path from 'node:path';
import type { ParsedPath } from 'node:path';
import * as url from 'node:url';
import * as fs from 'node:fs';
import * as fsP from 'node:fs/promises';
import type { SaveDialogReturnValue } from 'electron';
import {
  Fragment,
  useState,
  useMemo,
  type ReactElement,
  type ReactNode,
  type MouseEvent,
  type Dispatch as D,
  type SetStateAction as S
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { createStructuredSelector, type Selector } from 'reselect';
import { Button, Table, message, Popconfirm, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { UseMessageReturnType } from '@48tools-types/antd';
import { requestDownloadFileByStream } from '@48tools-api/48';
import { showSaveDialog } from '../../../utils/remote/dialog';
import getDownloadWorker from '../../../utils/worker/download.worker/getDownloadWorker';
import type { MessageEventData } from '../../../utils/worker/download.worker/download.worker';
import getFFmpegDownloadWorker from '../../../utils/worker/FFmpegDownload.worker/getFFmpegDownloadWorker';
import type {
  MessageEventData as FFmpegMessageEventData,
  ProgressMessageEventData
} from '../../../utils/worker/FFmpegDownload.worker/FFmpegDownload.worker';
import Header from '../../../components/Header/Header';
import BilibiliLogin from '../../../functionalComponents/BilibiliLogin/BilibiliLogin';
import AddForm, { bilibiliVideoTypesMap } from './AddForm/AddForm';
import AddBySearch from './AddBySearch/AddBySearch';
import {
  bilibiliDownloadListSelectors,
  setDeleteDownloadList,
  setDownloadProgress,
  setAddDownloadWorker,
  setDeleteDownloadWorker,
  type BilibiliDownloadInitialState
} from '../reducers/bilibiliDownload';
import { getFFmpeg } from '../../../utils/utils';
import { proxyServerInit, getProxyServerPort } from '../../../utils/proxyServer/proxyServer';
import { ProgressNative, type ProgressSet } from '../../../components/ProgressNative/index';
import { getFilePath } from '../../../utils/utils';
import type { DownloadItem } from '../types';
import type { WebWorkerChildItem } from '../../../commonTypes';

/* redux selector */
type RSelector = Pick<BilibiliDownloadInitialState, 'downloadProgress' | 'downloadWorkerList'> & {
  downloadList: Array<DownloadItem>;
};
type RState = { bilibiliDownload: BilibiliDownloadInitialState };

const selector: Selector<RState, RSelector> = createStructuredSelector({
  // 下载任务列表
  downloadList: ({ bilibiliDownload }: RState): Array<DownloadItem> => bilibiliDownloadListSelectors.selectAll(bilibiliDownload),

  // 进度条列表
  downloadProgress: ({ bilibiliDownload }: RState): { [key: string]: ProgressSet } => bilibiliDownload.downloadProgress,

  // 下载的worker
  downloadWorkerList: ({ bilibiliDownload }: RState): Array<WebWorkerChildItem> => bilibiliDownload.downloadWorkerList
});

/* 视频下载 */
function Download(props: {}): ReactElement {
  const { downloadList, downloadProgress, downloadWorkerList }: RSelector = useSelector(selector);
  const dispatch: Dispatch = useDispatch();
  const [messageApi, messageContextHolder]: UseMessageReturnType = message.useMessage();
  const [downloadSelectedRowKeys, setDownloadSelectedRowKeys]: [Array<string>, D<S<Array<string>>>] = useState([]); // 选中状态
  const [downloadSelectedLoading, setDownloadSelectedLoading]: [boolean, D<S<boolean>>] = useState(false); // 下载loading

  // 下载封面
  async function handleDownloadPicClick(item: DownloadItem, event: MouseEvent): Promise<void> {
    if (item.pic === undefined || item.pic === '') {
      return;
    }

    try {
      const urlResult: url.URL = new url.URL(item.pic);
      const parseResult: ParsedPath = path.parse(urlResult.pathname);
      const result: SaveDialogReturnValue = await showSaveDialog({
        defaultPath: getFilePath({
          typeTitle: 'B站封面下载',
          infoArray: [item.type, item.id, item.title ?? ''],
          ext: parseResult.ext
        })
      });

      if (result.canceled || !result.filePath) return;

      await requestDownloadFileByStream(item.pic, result.filePath);
      messageApi.success('图片下载完成！');
    } catch (err) {
      console.error(err);
    }
  }

  // 停止
  function handleStopWorkerClick(record: DownloadItem, event?: MouseEvent): void {
    const index: number = downloadWorkerList.findIndex((o: WebWorkerChildItem): boolean => o.id === record.qid);

    if (index >= 0) {
      downloadWorkerList[index].worker.postMessage({ type: 'stop' });
    }
  }

  // dash worker
  function createDashWorker(item: DownloadItem, filePath: string): void {
    const proxyPort: number = getProxyServerPort().port;
    const worker: Worker = getFFmpegDownloadWorker();
    let isStop: boolean = false;

    worker.addEventListener('message', function(messageEvent: MessageEvent<FFmpegMessageEventData>): void {
      if (messageEvent.data.type === 'progress') {
        const messageEventData: ProgressMessageEventData = messageEvent.data;

        !isStop && requestIdleCallback((): void => {
          !isStop && dispatch(setDownloadProgress({
            type: 'progress',
            qid: item.qid,
            data: messageEventData.data
          }));
        });
      } else if (messageEvent.data.type === 'error' || messageEvent.data.type === 'close') {
        isStop = true;

        if (messageEvent.data.type === 'error') {
          messageApi.error('bilibili视频下载失败！');
        }

        messageApi.success('下载完成！');
        worker.terminate();
        dispatch(setDeleteDownloadWorker(item));
      }
    });

    worker.postMessage({
      type: 'start',
      ffmpeg: getFFmpeg(),
      playStreamPath: [
        `http://localhost:${ proxyPort }/proxy/bilibili-video?url=${ encodeURIComponent(item.dash!.video) }`,
        `http://localhost:${ proxyPort }/proxy/bilibili-video?url=${ encodeURIComponent(item.dash!.audio) }`
      ],
      filePath,
      qid: item.qid,
      concat: true
    });

    dispatch(setAddDownloadWorker({
      id: item.qid,
      worker
    }));
  }

  // create worker
  function createWorker(item: DownloadItem, filePath: string): void {
    const worker: Worker = getDownloadWorker();

    worker.addEventListener('message', function(messageEvent: MessageEvent<MessageEventData>): void {
      const { type }: MessageEventData = messageEvent.data;

      requestIdleCallback((): void => {
        dispatch(setDownloadProgress(messageEvent.data));

        if (type === 'success') {
          messageApi.success('下载完成！');
          worker.terminate();
        }
      });
    });

    worker.postMessage({
      type: 'start',
      filePath,
      durl: item.durl,
      qid: item.qid
    });
  }

  // 下载选中
  async function handleDownloadSelectedClick(event: MouseEvent): Promise<void> {
    const selectedDownloadList: Array<DownloadItem> = downloadList.filter(
      (o: DownloadItem): boolean => downloadSelectedRowKeys.includes(o.qid));

    try {
      if (selectedDownloadList.length) {
        const result: SaveDialogReturnValue = await showSaveDialog({
          properties: ['createDirectory'],
          defaultPath: getFilePath({
            typeTitle: 'B站视频下载(合集)',
            infoArray: ['下载合集', 'video-length', selectedDownloadList.length]
          })
        });

        if (result.canceled || !result.filePath) return;

        setDownloadSelectedLoading(true);

        if (!fs.existsSync(result.filePath)) {
          await fsP.mkdir(result.filePath);
        }

        for (let i: number = 0, j: number = selectedDownloadList.length; i < j; i++) {
          const item: DownloadItem = selectedDownloadList[i];

          if (item.dash) {
            createDashWorker(item, path.join(result.filePath, getFilePath({
              typeTitle: 'B站视频下载(DASH)',
              infoArray: [`${ item.type }${ item.id }`, item.page, item.title ?? ''],
              ext: 'mp4'
            })));
          } else {
            const urlResult: url.URL = new url.URL(item.durl);
            const parseResult: ParsedPath = path.parse(urlResult.pathname);

            createWorker(item, path.join(result.filePath, getFilePath({
              typeTitle: 'B站视频下载',
              infoArray: [`${ item.type }${ item.id }`, item.page, item.title ?? ''],
              ext: parseResult.ext
            })));
          }
        }
      }
    } catch (err) {
      console.error(err);
      messageApi.error('下载失败！');
    }

    setDownloadSelectedLoading(false);
    setDownloadSelectedRowKeys([]);
  }

  // dash下载
  async function handleDashDownloadClick(item: DownloadItem, event: MouseEvent): Promise<void> {
    try {
      const result: SaveDialogReturnValue = await showSaveDialog({
        defaultPath: getFilePath({
          typeTitle: 'B站视频下载(DASH)',
          infoArray: [`${ item.type }${ item.id }`, item.page, item.title ?? ''],
          ext: 'mp4'
        })
      });

      if (result.canceled || !result.filePath) return;

      createDashWorker(item, result.filePath);
    } catch (err) {
      console.error(err);
    }
  }

  // 下载
  async function handleDownloadClick(item: DownloadItem, event: MouseEvent): Promise<void> {
    try {
      const urlResult: url.URL = new url.URL(item.durl);
      const parseResult: ParsedPath = path.parse(urlResult.pathname);
      const result: SaveDialogReturnValue = await showSaveDialog({
        defaultPath: getFilePath({
          typeTitle: 'B站视频下载',
          infoArray: [`${ item.type }${ item.id }`, item.page, item.title ?? ''],
          ext: parseResult.ext
        })
      });

      if (result.canceled || !result.filePath) return;

      createWorker(item, result.filePath);
    } catch (err) {
      console.error(err);
      messageApi.error('视频下载失败！');
    }
  }

  // 删除一个任务
  function handleDeleteTaskClick(item: DownloadItem, event: MouseEvent): void {
    dispatch(setDeleteDownloadList(item.qid));
  }

  const columns: ColumnsType<DownloadItem> = [
    { title: 'ID', dataIndex: 'id' },
    {
      title: '下载类型',
      dataIndex: 'type',
      render: (value: string, record: DownloadItem, index: number): string => bilibiliVideoTypesMap[value]
    },
    { title: '分页', dataIndex: 'page' },
    {
      title: '下载进度',
      dataIndex: 'qid',
      render: (value: string, record: DownloadItem, index: number): ReactNode => {
        const inDownload: boolean = Object.hasOwn(downloadProgress, value);

        if (inDownload) {
          return <ProgressNative progressSet={ downloadProgress[value] } />;
        } else {
          return '等待下载';
        }
      }
    },
    {
      title: (
        <Fragment>
          操作
          <Button className="ml-[6px]"
            type="primary"
            ghost={ true }
            disabled={ downloadSelectedRowKeys.length <= 0 }
            loading={ downloadSelectedLoading }
            onClick={ handleDownloadSelectedClick }
          >
            下载选中
          </Button>
        </Fragment>
      ),
      key: 'action',
      width: 220,
      render: (value: undefined, record: DownloadItem, index: number): ReactElement => {
        const inDownload: boolean = record.qid in downloadProgress;

        return (
          <Space.Compact>
            {
              record.dash && inDownload ? (
                <Popconfirm title="确定要停止下载吗？"
                  onConfirm={ (event?: MouseEvent): void => handleStopWorkerClick(record, event) }
                >
                  <Button type="primary" danger={ true }>停止</Button>
                </Popconfirm>
              ) : (
                <Button disabled={ inDownload }
                  onClick={ record.dash
                    ? (event: MouseEvent): Promise<void> => handleDashDownloadClick(record, event)
                    : (event: MouseEvent): Promise<void> => handleDownloadClick(record, event) }
                >
                  下载
                </Button>
              )
            }
            <Button disabled={ record.pic === undefined || record.pic === '' }
              onClick={ (event: MouseEvent): Promise<void> => handleDownloadPicClick(record, event) }
            >
              封面
            </Button>
            <Button type="primary"
              danger={ true }
              disabled={ inDownload }
              onClick={ (event: MouseEvent): void => handleDeleteTaskClick(record, event) }
            >
              删除
            </Button>
          </Space.Compact>
        );
      }
    }
  ];

  useMemo(function(): void {
    proxyServerInit();
  }, []);

  return (
    <Fragment>
      <Header>
        <Space.Compact>
          <BilibiliLogin />
          <AddBySearch />
          <AddForm />
        </Space.Compact>
      </Header>
      <Table size="middle"
        columns={ columns }
        dataSource={ downloadList }
        bordered={ true }
        rowKey="qid"
        rowSelection={{
          type: 'checkbox',
          selectedRowKeys: downloadSelectedRowKeys,
          onChange(selectedRowKeys: Array<string>): void {
            setDownloadSelectedRowKeys(selectedRowKeys);
          }
        }}
        pagination={{
          showQuickJumper: true,
          onChange(): void {
            setDownloadSelectedRowKeys([]);
          }
        }}
      />
      { messageContextHolder }
    </Fragment>
  );
}

export default Download;