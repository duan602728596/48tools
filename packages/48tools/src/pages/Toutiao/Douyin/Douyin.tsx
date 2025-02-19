import * as path from 'node:path';
import * as fs from 'node:fs';
import * as fsP from 'node:fs/promises';
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
import { useSelector, useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { createStructuredSelector, type Selector } from 'reselect';
import { Button, Table, message, Alert, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { UseMessageReturnType } from '@48tools-types/antd';
import filenamify from 'filenamify/browser';
import * as dayjs from 'dayjs';
import { requestGetVideoRedirectUrl } from '@48tools-api/toutiao/douyin';
import style from './douyin.sass';
import { showSaveDialog } from '../../../utils/remote/dialog';
import getDownloadWorker from '../../../utils/worker/download.worker/getDownloadWorker';
import type { MessageEventData } from '../../../utils/worker/download.worker/download.worker';
import Header from '../../../components/Header/Header';
import VideoOrUserParse from './VideoOrUserParse/VideoOrUserParse';
import { douyinCookie } from '../../../utils/toutiao/DouyinCookieStore';
import {
  douyinDownloadListSelectors,
  setDeleteDownloadList,
  setDownloadProgress,
  type DouyinDownloadInitialState
} from '../reducers/douyinDownload';
import { fileTimeFormat, getFilePath } from '../../../utils/utils';
import { ProgressNative, type ProgressSet } from '../../../components/ProgressNative/index';
import type { DownloadItem } from '../types';

/* redux selector */
type RSelector = Pick<DouyinDownloadInitialState, 'downloadProgress'> & {
  downloadList: Array<DownloadItem>;
};
type RState = { douyinDownload: DouyinDownloadInitialState };

const selector: Selector<RState, RSelector> = createStructuredSelector({
  // 下载任务列表
  downloadList: ({ douyinDownload }: RState): Array<DownloadItem> => douyinDownloadListSelectors.selectAll(douyinDownload),

  // 进度条列表
  downloadProgress: ({ douyinDownload }: RState): { [key: string]: ProgressSet } => douyinDownload.downloadProgress
});

/* 抖音视频下载 */
function Douyin(props: {}): ReactElement {
  const { downloadList, downloadProgress }: RSelector = useSelector(selector);
  const dispatch: Dispatch = useDispatch();
  const [messageApi, messageContextHolder]: UseMessageReturnType = message.useMessage();
  const [downloadSelectedRowKeys, setDownloadSelectedRowKeys]: [Array<string>, D<S<Array<string>>>] = useState([]); // 选中状态
  const [downloadSelectedLoading, setDownloadSelectedLoading]: [boolean, D<S<boolean>>] = useState(false); // 下载loading

  // 清除抖音的cookie
  function handleClearDouyinCookie(event: MouseEvent): void {
    douyinCookie.reset();
    messageApi.success('Cookie已清除！');
  }

  // 删除一个任务
  function handleDeleteTaskClick(item: DownloadItem, event: MouseEvent): void {
    dispatch(setDeleteDownloadList(item.qid));

    // 删除选中
    const index: number = downloadSelectedRowKeys.indexOf(item.qid);

    if (index >= 0) {
      downloadSelectedRowKeys.splice(index, 1);
      setDownloadSelectedRowKeys([...downloadSelectedRowKeys]);
    }
  }

  // 下载单个
  function downloadItem(item: DownloadItem, filePath: string): Promise<void> {
    return new Promise(async (resolve: Function, reject: Function): Promise<void> => {
      const worker: Worker = getDownloadWorker();

      worker.addEventListener('message', function(messageEvent: MessageEvent<MessageEventData>): void {
        const { type }: MessageEventData = messageEvent.data;

        dispatch(setDownloadProgress(messageEvent.data));

        if (type === 'success') {
          messageApi.success('下载完成！');
          worker.terminate();
          resolve();
        }
      });

      let uri: string = item.url;

      // 对抖音视频地址302重定向的处理
      if (/douyin\.com/.test(uri)) {
        const res: string = await requestGetVideoRedirectUrl(item.url);
        const parseDocument: Document = new DOMParser().parseFromString(res, 'text/html');

        uri = parseDocument.querySelector('a')!.getAttribute('href')!;
      }

      worker.postMessage({
        type: 'start',
        filePath,
        durl: uri,
        qid: item.qid,
        headers: {
          Referer: 'https://www.douyin.com/'
        },
        resStatus302: true
      });
    });
  }

  // 下载选中
  async function handleDownloadSelectedClick(event: MouseEvent): Promise<void> {
    const selectedDownloadList: Array<DownloadItem> = downloadList.filter(
      (o: DownloadItem): boolean => downloadSelectedRowKeys.includes(o.qid));

    try {
      if (selectedDownloadList.length) {
        const defaultDir: string = `[抖音]下载合集_${ dayjs().format(fileTimeFormat) }`;
        const result: SaveDialogReturnValue = await showSaveDialog({
          properties: ['createDirectory'],
          defaultPath: defaultDir
        });

        if (result.canceled || !result.filePath) return;

        setDownloadSelectedLoading(true);

        if (!fs.existsSync(result.filePath)) {
          await fsP.mkdir(result.filePath);
        }

        for (let i: number = 0, j: number = selectedDownloadList.length; i < j; i++) {
          const item: DownloadItem = selectedDownloadList[i];
          let fileExt: string = '.mp4';

          if (item.isImage) {
            const urlResult: URL = new URL(item.url);

            fileExt = path.parse(urlResult.pathname).ext;
          }

          await downloadItem(item, path.join(result.filePath, `${ filenamify(selectedDownloadList[i].title) }_${ i }${ fileExt }`));
        }
      }
    } catch (err) {
      console.error(err);
      messageApi.error('下载失败！');
    }

    setDownloadSelectedLoading(false);
    setDownloadSelectedRowKeys([]);
  }

  // 下载
  async function handleDownloadClick(item: DownloadItem, event: MouseEvent): Promise<void> {
    try {
      const infoArray: Array<string> = [item.title];

      if (typeof item.width === 'number' && typeof item.height === 'number') {
        infoArray.push(`${ item.width }x${ item.height }`);
      }

      let fileExt: string = '.mp4';

      if (item.isImage) {
        const urlResult: URL = new URL(item.url);

        fileExt = path.parse(urlResult.pathname).ext;
      }

      const result: SaveDialogReturnValue = await showSaveDialog({
        defaultPath: getFilePath({
          typeTitle: item.isImage ? '抖音图片下载' : '抖音视频下载',
          infoArray,
          ext: fileExt
        })
      });

      if (result.canceled || !result.filePath) return;

      await downloadItem(item, result.filePath);
    } catch (err) {
      console.error(err);
      messageApi.error('下载失败！');
    }
  }

  const columns: ColumnsType<DownloadItem> = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (value: string, record: DownloadItem, index: number): ReactElement =>
        <span className={ record.isImage ? style.isImageMark : undefined }>{ value }</span>
    },
    {
      title: '尺寸',
      key: 'width_height',
      width: 120,
      render: (value: undefined, record: DownloadItem, index: number): ReactNode => {
        if (typeof record.width === 'number' && typeof record.height === 'number') {
          return `${ record.width } * ${ record.height }`;
        } else {
          return '无水印';
        }
      }
    },
    {
      title: '下载进度',
      dataIndex: 'qid',
      width: 95,
      render: (value: string, record: DownloadItem, index: number): ReactNode => {
        const inDownload: boolean = value in downloadProgress;

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
      width: 155,
      render: (value: undefined, record: DownloadItem, index: number): ReactElement => {
        const inDownload: boolean = Object.hasOwn(downloadProgress, record.qid);

        return (
          <Space.Compact>
            <Button disabled={ inDownload }
              onClick={ (event: MouseEvent): Promise<void> => handleDownloadClick(record, event) }
            >
              下载
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

  return (
    <Fragment>
      <Header>
        <VideoOrUserParse />
        <Button type="primary" danger={ true } onClick={ handleClearDouyinCookie }>清除抖音Cookie的缓存</Button>
      </Header>
      <Alert className="mb-[8px]" type="warning" message={ [
        '输入视频ID或视频地址下载单个视频，输入用户ID或用户主页地址可解析用户的所有视频并选择下载。支持短链接。',
        <br key="br" />,
        '由于抖音风控的原因，用户视频下载可能需要验证一次或两次验证码。验证后仍然解析失败，请先登录后下载。'
      ] } />
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

export default Douyin;