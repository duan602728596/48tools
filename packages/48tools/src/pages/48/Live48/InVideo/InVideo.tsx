import { promises as fsP } from 'node:fs';
import type { SaveDialogReturnValue } from 'electron';
import {
  Fragment,
  useState,
  useEffect,
  type ReactElement,
  type ReactNode,
  type Dispatch as D,
  type SetStateAction as S,
  type MouseEvent
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { createStructuredSelector, type Selector } from 'reselect';
import { Select, Button, Table, message, Space, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { UseMessageReturnType } from '@48tools-types/antd';
import filenamify from 'filenamify/browser';
import style from './inVideo.sass';
import { showSaveDialog } from '../../../../utils/remote/dialog';
import getFFmpegDownloadWorker from '../../../../utils/worker/FFmpegDownload.worker/getFFmpegDownloadWorker';
import Header from '../../../../components/Header/Header';
import {
  setInVideoQuery,
  setInVideoList,
  setVideoListChildAdd,
  setVideoListChildDelete,
  setDownloadProgress,
  type Live48InitialState
} from '../../reducers/live48';
import { parseInVideoUrl, parseVideoItem } from '../function/parseLive48Website';
import { requestDownloadFile } from '../../services/pocket48';
import { getFFmpeg, getFileTime } from '../../../../utils/utils';
import { proxyServerInit, getProxyServerPort } from '../../../../utils/proxyServer/proxyServer';
import { ProgressNative, type ProgressSet } from '../../../../components/ProgressNative/index';
import type { MessageEventData } from '../../../../utils/worker/FFmpegDownload.worker/FFmpegDownload.worker';
import type { InVideoQuery, InVideoItem, InVideoWebWorkerItem } from '../../types';

/**
 * 格式化m3u8文件内视频的地址
 * @param { string } data: m3u8文件内容
 * @param { string } m3u8Url: m3u8文件的路径
 */
function formatTsUrl(data: string, m3u8Url: string): [string, Array<string>] {
  const port: number = getProxyServerPort().port;
  const dataArr: string[] = data.split('\n');
  const newStrArr: string[] = [];

  // m3u8文件所在的文件夹
  const m3u8Pathname: string = m3u8Url.split(/\?/)[0].replace(/\/[^/]+$/, '');

  for (const item of dataArr) {
    if (/^#/.test(item) || item === '') {
      newStrArr.push(item);
    } else if (/^\//.test(item)) {
      const tsUrl: string = `https://ts.48.cn${ item }`;

      newStrArr.push(`http://localhost:${ port }/proxy/ts48?url=${ encodeURIComponent(tsUrl) }`);
    } else {
      const tsUrl: string = `${ m3u8Pathname }/${ item }`;

      newStrArr.push(`http://localhost:${ port }/proxy/ts48?url=${ encodeURIComponent(tsUrl) }`);
    }
  }

  return [
    newStrArr.join('\n'),
    newStrArr.filter((item: string): boolean => !(/^#/.test(item) || item === ''))
  ];
}

/* redux selector */
type RSelector = Pick<Live48InitialState, 'inVideoQuery' | 'inVideoList' | 'videoListChild' | 'progress'>;
type RState = { live48: Live48InitialState };

const selector: Selector<RState, RSelector> = createStructuredSelector({
  // 查询条件
  inVideoQuery: ({ live48 }: RState): InVideoQuery | undefined => live48?.inVideoQuery,

  // 录播列表
  inVideoList: ({ live48 }: RState): Array<InVideoItem> => live48.inVideoList,

  // 正在下载
  videoListChild: ({ live48 }: RState): Array<InVideoWebWorkerItem> => live48.videoListChild,

  // 进度条列表
  progress: ({ live48 }: RState): Record<string, ProgressSet> => live48.progress
});

/* 录播下载 */
function InVideo(props: {}): ReactElement {
  const { inVideoQuery, inVideoList, videoListChild, progress }: RSelector = useSelector(selector);
  const dispatch: Dispatch = useDispatch();
  const [messageApi, messageContextHolder]: UseMessageReturnType = message.useMessage();
  const [loading, setLoading]: [boolean, D<S<boolean>>] = useState(false);

  // 停止下载
  function handleStopClick(record: InVideoItem, event?: MouseEvent): void {
    const index: number = videoListChild.findIndex(
      (o: InVideoWebWorkerItem): boolean => o.id === record.id && o.liveType === record.liveType);

    if (index >= 0) {
      videoListChild[index].worker.postMessage({ type: 'stop' });
    }
  }

  // 开始下载
  async function handleDownloadClick(record: InVideoItem, quality: string, event: MouseEvent): Promise<void> {
    try {
      const m3u8Url: { url: string; title: string } | null = await parseVideoItem(record, quality);

      if (!m3u8Url) {
        messageApi.warning('视频不存在！');

        return;
      }

      const result: SaveDialogReturnValue = await showSaveDialog({
        defaultPath: `[48公演录播]${ record.liveType }_${ filenamify(m3u8Url.title) }`
          + `@${ record.id }__${ quality }_${ getFileTime() }.ts`
      });

      if (result.canceled || !result.filePath) return;

      const m3u8File: string = `${ result.filePath }.m3u8`;
      const m3u8Data: string = await requestDownloadFile(m3u8Url.url);
      const [m3u8UrlF]: [string, Array<string>] = formatTsUrl(m3u8Data, m3u8Url.url);

      await fsP.writeFile(m3u8File, m3u8UrlF);

      const worker: Worker = getFFmpegDownloadWorker();

      worker.addEventListener('message', function(workerEvent: MessageEvent<MessageEventData>) {
        const { type }: MessageEventData = workerEvent.data;

        if (type === 'progress') {
          dispatch(setDownloadProgress(workerEvent.data));
        }

        if (type === 'close' || type === 'error') {
          if (type === 'error') {
            messageApi.error(`视频：${ record.title } 下载失败！`);
          }

          worker.terminate();
          dispatch(setVideoListChildDelete(record));
        }
      }, false);

      worker.postMessage({
        type: 'start',
        playStreamPath: m3u8File,
        filePath: result.filePath,
        ffmpeg: getFFmpeg(),
        protocolWhitelist: true,
        qid: record.id
      });

      dispatch(setVideoListChildAdd({
        id: record.id,
        liveType: record.liveType,
        worker
      }));
    } catch (err) {
      console.error(err);
      messageApi.error('下载失败！');
    }
  }

  // 查询
  function handleLiveTypeSelect(value: string): void {
    dispatch(setInVideoQuery({
      liveType: value
    }));
  }

  // 页码变化
  async function handlePageChange(page: number, pageSize: number): Promise<void> {
    setLoading(true);

    try {
      const res: {
        data: Array<InVideoItem>;
        total: number;
      } = await parseInVideoUrl(inVideoQuery, page);

      dispatch(setInVideoList({
        data: res.data,
        page,
        total: res.total
      }));
    } catch (err) {
      console.error(err);
      messageApi.error('录播加载失败！');
    }

    setLoading(false);
  }

  // 解析并加载列表
  async function handleGetVideoListClick(event: MouseEvent): Promise<void> {
    setLoading(true);

    try {
      const res: {
        data: Array<InVideoItem>;
        total: number;
      } = await parseInVideoUrl(inVideoQuery, 1);

      dispatch(setInVideoList({
        data: res.data,
        page: 1,
        total: res.total
      }));
    } catch (err) {
      console.error(err);
      messageApi.error('录播加载失败！');
    }

    setLoading(false);
  }

  const columns: ColumnsType<InVideoItem> = [
    { title: 'ID', dataIndex: 'id' },
    { title: '标题', dataIndex: 'title' },
    {
      title: '说明',
      dataIndex: 'description',
      render: (value: string, record: InVideoItem, index: number): ReactElement => <span dangerouslySetInnerHTML={{ __html: value }} />
    },
    {
      title: '下载进度',
      dataIndex: 'id',
      render: (value: string, record: InVideoItem, index: number): ReactNode => {
        const inDownload: boolean = Object.hasOwn(progress, value);
        const idx: number = videoListChild.findIndex(
          (o: InVideoWebWorkerItem): boolean => o.id === record.id && o.liveType === record.liveType);

        if (inDownload) {
          return <ProgressNative progressSet={ progress[value] } />;
        } else {
          return idx >= 0 ? '准备中' : '未下载';
        }
      }
    },
    {
      title: '操作',
      key: 'handle',
      width: 210,
      render: (value: undefined, record: InVideoItem, index: number): ReactElement => {
        const idx: number = videoListChild.findIndex(
          (o: InVideoWebWorkerItem): boolean => o.id === record.id && o.liveType === record.liveType);

        return idx >= 0 ? (
          <Popconfirm title="确定要停止下载吗？"
            onConfirm={ (event?: MouseEvent): void => handleStopClick(record, event) }
          >
            <Button type="primary" danger={ true }>停止下载</Button>
          </Popconfirm>
        ) : (
          <Button.Group>
            <Button onClick={
              (event: MouseEvent): Promise<void> => handleDownloadClick(record, 'chao', event) }
            >
              超清
            </Button>
            <Button onClick={
              (event: MouseEvent): Promise<void> => handleDownloadClick(record, 'gao', event) }
            >
              高清
            </Button>
            <Button onClick={
              (event: MouseEvent): Promise<void> => handleDownloadClick(record, 'liuchang', event) }
            >
              流畅
            </Button>
          </Button.Group>
        );
      }
    }
  ];

  useEffect(function(): void {
    proxyServerInit();
  }, []);

  return (
    <Fragment>
      <Header>
        <Space size={ 8 } data-test-id="bilibili-download-live-type">
          <Select className={ style.typeSelect } value={ inVideoQuery?.liveType } onSelect={ handleLiveTypeSelect }>
            <Select.Option value="snh48">SNH48</Select.Option>
            <Select.Option value="bej48">BEJ48</Select.Option>
            <Select.Option value="gnz48">GNZ48</Select.Option>
            <Select.Option value="ckg48">CKG48</Select.Option>
          </Select>
          <Button type="primary" disabled={ inVideoQuery === undefined } onClick={ handleGetVideoListClick }>加载录播</Button>
        </Space>
      </Header>
      <Table size="middle"
        columns={ columns }
        dataSource={ inVideoList }
        bordered={ true }
        loading={ loading }
        rowKey="id"
        pagination={{
          showQuickJumper: true,
          showSizeChanger: false,
          pageSize: 15,
          total: inVideoQuery?.total ?? 0,
          current: inVideoQuery?.page ?? 1,
          onChange: handlePageChange
        }}
      />
      { messageContextHolder }
    </Fragment>
  );
}

export default InVideo;