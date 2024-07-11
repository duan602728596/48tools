import { promises as fsP } from 'node:fs';
import type { SaveDialogReturnValue } from 'electron';
import { Fragment, useEffect, useMemo, useTransition, type ReactElement, type ReactNode, type MouseEvent, type TransitionStartFunction } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { createStructuredSelector, type Selector } from 'reselect';
import { Select, Button, Table, message, Space, Popconfirm } from 'antd';
import * as dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import type { UseMessageReturnType } from '@48tools-types/antd';
import filenamify from 'filenamify/browser';
import {
  requestDownloadFile,
  requestOpenLiveList,
  requestLiveOne,
  type OpenLiveList,
  type OpenLiveInfo,
  type LiveOne,
  type LiveOnePlayStreams
} from '@48tools-api/48';
import style from './inVideo.sass';
import { showSaveDialog } from '../../../../utils/remote/dialog';
import getFFmpegDownloadWorker from '../../../../utils/worker/FFmpegDownload.worker/getFFmpegDownloadWorker';
import Header from '../../../../components/Header/Header';
import {
  setVideoListChildAdd,
  setVideoListChildDelete,
  setDownloadProgress,
  setInVideoQueryLiveType,
  setInVideoGroupList,
  type Live48InitialState
} from '../../reducers/live48';
import { getFFmpeg, getFileTime } from '../../../../utils/utils';
import { proxyServerInit } from '../../../../utils/proxyServer/proxyServer';
import { ProgressNative, type ProgressSet } from '../../../../components/ProgressNative/index';
import { formatTsUrl, getTeamId } from '../function/utils';
import type { WebWorkerChildItem } from '../../../../commonTypes';
import type { MessageEventData } from '../../../../utils/worker/FFmpegDownload.worker/FFmpegDownload.worker';

/* redux selector */
type RSelector = Pick<Live48InitialState,
  'videoListChild' | 'progress' | 'inVideoQueryLiveType'
  | 'snh48NextPage' | 'bej48NextPage' | 'gnz48NextPage' | 'ckg48NextPage' | 'cgt48NextPage'
  | 'snh48InVideoList' | 'bej48InVideoList' | 'gnz48InVideoList' | 'ckg48InVideoList' | 'cgt48InVideoList'
>;
type RState = { live48: Live48InitialState };

const selector: Selector<RState, RSelector> = createStructuredSelector({
  // 正在下载
  videoListChild: ({ live48 }: RState): Array<WebWorkerChildItem> => live48.videoListChild,

  // 进度条列表
  progress: ({ live48 }: RState): Record<string, ProgressSet> => live48.progress,

  // LiveType
  inVideoQueryLiveType: ({ live48 }: RState): string | undefined => live48.inVideoQueryLiveType,

  snh48NextPage: ({ live48 }: RState): number => live48.snh48NextPage,
  bej48NextPage: ({ live48 }: RState): number => live48.bej48NextPage,
  gnz48NextPage: ({ live48 }: RState): number => live48.gnz48NextPage,
  ckg48NextPage: ({ live48 }: RState): number => live48.ckg48NextPage,
  cgt48NextPage: ({ live48 }: RState): number => live48.cgt48NextPage,

  snh48InVideoList: ({ live48 }: RState): Array<OpenLiveInfo> => live48.snh48InVideoList,
  bej48InVideoList: ({ live48 }: RState): Array<OpenLiveInfo> => live48.bej48InVideoList,
  gnz48InVideoList: ({ live48 }: RState): Array<OpenLiveInfo> => live48.gnz48InVideoList,
  ckg48InVideoList: ({ live48 }: RState): Array<OpenLiveInfo> => live48.ckg48InVideoList,
  cgt48InVideoList: ({ live48 }: RState): Array<OpenLiveInfo> => live48.cgt48InVideoList
});

/* 录播下载 */
function InVideo(props: {}): ReactElement {
  const rSelector: RSelector = useSelector(selector);
  const {
    videoListChild, progress, inVideoQueryLiveType,
    snh48InVideoList, bej48InVideoList, gnz48InVideoList, ckg48InVideoList, cgt48InVideoList
  }: RSelector = rSelector;
  const dispatch: Dispatch = useDispatch();
  const [messageApi, messageContextHolder]: UseMessageReturnType = message.useMessage();
  const [getLiveListLoading, startGetLiveListStartTransition]: [boolean, TransitionStartFunction] = useTransition();

  const inVideoList: Array<OpenLiveInfo> = useMemo(function(): Array<OpenLiveInfo> {
    if (inVideoQueryLiveType) return rSelector[`${ inVideoQueryLiveType }InVideoList`];

    return [];
  }, [rSelector, inVideoQueryLiveType,
    snh48InVideoList, bej48InVideoList, gnz48InVideoList, ckg48InVideoList, cgt48InVideoList]);

  // 停止下载
  function handleStopClick(record: OpenLiveInfo, event?: MouseEvent): void {
    const index: number = videoListChild.findIndex(
      (o: WebWorkerChildItem): boolean => o.id === record.liveId);

    if (index >= 0) {
      videoListChild[index].worker.postMessage({ type: 'stop' });
    }
  }

  // 开始下载
  async function handleDownloadClick(record: OpenLiveInfo, event: MouseEvent): Promise<void> {
    try {
      const resLiveOne: LiveOne = await requestLiveOne(record.liveId);
      const playStream: Array<LiveOnePlayStreams> = resLiveOne?.content?.playStreams ?? [];

      if (!playStream.length) {
        messageApi.warning('视频不存在！');

        return;
      }

      const playStreamItem: LiveOnePlayStreams | undefined = playStream
        .filter((o: LiveOnePlayStreams): boolean => !!o.streamPath)
        .at(-1);

      if (!(playStreamItem?.streamPath)) {
        messageApi.warning('视频不存在！');

        return;
      }

      const result: SaveDialogReturnValue = await showSaveDialog({
        defaultPath: `[48公演录播]${ filenamify(record.title) }`
          + `@${ record.liveId }_${ getFileTime() }.ts`
      });

      if (result.canceled || !result.filePath) return;

      const m3u8File: string = `${ result.filePath }.m3u8`;
      const m3u8Data: string = await requestDownloadFile(playStreamItem.streamPath);
      const [m3u8UrlF]: [string, Array<string>] = formatTsUrl(m3u8Data, playStreamItem.streamPath);

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
        qid: record.liveId
      });

      dispatch(setVideoListChildAdd({
        id: record.liveId,
        worker
      }));
    } catch (err) {
      console.error(err);
      messageApi.error('下载失败！');
    }
  }

  // 查询
  function handleLiveTypeSelect(value: string): void {
    dispatch(setInVideoQueryLiveType(value));
  }

  // 加载下一页
  function handleGetVideoListClick(event: MouseEvent): void {
    if (!inVideoQueryLiveType) return;

    startGetLiveListStartTransition(async (): Promise<void> => {
      try {
        const res: OpenLiveList = await requestOpenLiveList({
          groupId: getTeamId(inVideoQueryLiveType),
          record: true
        });

        if (res?.content?.liveList) {
          dispatch(setInVideoGroupList({
            liveType: inVideoQueryLiveType,
            data: res.content.liveList,
            nextPage: Number(res.content.next)
          }));
        } else {
          messageApi.error('录播加载失败！');
        }
      } catch (err) {
        console.error(err);
        messageApi.error('录播加载失败！');
      }
    });
  }

  // 刷新列表
  function handleGetNextPageVideoListClick(event: MouseEvent): void {
    if (!inVideoQueryLiveType) return;

    startGetLiveListStartTransition(async (): Promise<void> => {
      try {
        const res: OpenLiveList = await requestOpenLiveList({
          groupId: getTeamId(inVideoQueryLiveType),
          record: true,
          next: rSelector[`${ inVideoQueryLiveType }NextPage`]
        });

        if (res?.content?.liveList) {
          dispatch(setInVideoGroupList({
            liveType: inVideoQueryLiveType,
            data: inVideoList.concat(res.content.liveList),
            nextPage: Number(res.content.next)
          }));
        } else {
          messageApi.error('录播加载失败！需要登录账号！');
        }
      } catch (err) {
        console.error(err);
        messageApi.error('录播加载失败！');
      }
    });
  }

  // 渲染分页
  function showTotalRender(total: number, range: [number, number]): ReactElement {
    return <Button size="small" onClick={ handleGetNextPageVideoListClick }>加载下一页</Button>;
  }

  const columns: ColumnsType<OpenLiveInfo> = [
    { title: '标题', dataIndex: 'title' },
    { title: '副标题', dataIndex: 'subTitle' },
    {
      title: '下载进度',
      dataIndex: 'liveId',
      render: (value: string, record: OpenLiveInfo, index: number): ReactNode => {
        const inDownload: boolean = Object.hasOwn(progress, value);
        const idx: number = videoListChild.findIndex(
          (o: WebWorkerChildItem): boolean => o.id === record.liveId);

        if (inDownload) {
          return <ProgressNative progressSet={ progress[value] } />;
        } else {
          return idx >= 0 ? '准备中' : '未下载';
        }
      }
    },
    {
      title: '时间',
      dataIndex: 'stime',
      width: 165,
      render: (value: string, record: OpenLiveInfo, index: number): string => {
        return dayjs(Number(value)).format('YYYY-MM-DD HH:mm:ss');
      }
    },
    {
      title: '操作',
      key: 'handle',
      width: 110,
      render: (value: undefined, record: OpenLiveInfo, index: number): ReactElement => {
        const idx: number = videoListChild.findIndex(
          (o: WebWorkerChildItem): boolean => o.id === record.liveId);

        return idx >= 0 ? (
          <Popconfirm title="确定要停止下载吗？"
            onConfirm={ (event?: MouseEvent): void => handleStopClick(record, event) }
          >
            <Button type="primary" danger={ true }>停止下载</Button>
          </Popconfirm>
        ) : (
          <Button onClick={ (event: MouseEvent): Promise<void> => handleDownloadClick(record, event) }>
            下载
          </Button>
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
        <Space size={ 8 } data-test-id="48-in-video-group-type">
          <Select className={ style.typeSelect } value={ inVideoQueryLiveType } onSelect={ handleLiveTypeSelect }>
            <Select.Option value="snh48">SNH48</Select.Option>
            <Select.Option value="bej48">BEJ48</Select.Option>
            <Select.Option value="gnz48">GNZ48</Select.Option>
            <Select.Option value="ckg48">CKG48</Select.Option>
            <Select.Option value="cgt48">CGT48</Select.Option>
          </Select>
          <Button.Group>
            <Button type="primary" disabled={ inVideoQueryLiveType === undefined } onClick={ handleGetVideoListClick }>
              刷新录播
            </Button>
            <Button disabled={ inVideoQueryLiveType === undefined } onClick={ handleGetNextPageVideoListClick }>
              加载下一页
            </Button>
          </Button.Group>
        </Space>
      </Header>
      <Table size="middle"
        columns={ columns }
        dataSource={ inVideoList }
        bordered={ true }
        loading={ getLiveListLoading }
        rowKey="liveId"
        pagination={{
          showQuickJumper: true,
          showSizeChanger: false,
          pageSize: 20,
          showTotal: showTotalRender
        }}
      />
      { messageContextHolder }
    </Fragment>
  );
}

export default InVideo;