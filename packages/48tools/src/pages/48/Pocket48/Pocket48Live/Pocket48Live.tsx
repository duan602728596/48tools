import * as querystring from 'querystring';
import { ipcRenderer, SaveDialogReturnValue } from 'electron';
import { dialog } from '@electron/remote';
import { Fragment, useState, ReactElement, Dispatch as D, SetStateAction as S, MouseEvent } from 'react';
import type { Dispatch } from 'redux';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector, createStructuredSelector, Selector } from 'reselect';
import { Link } from 'react-router-dom';
import { Button, message, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { findIndex, pick } from 'lodash-es';
import * as dayjs from 'dayjs';
import * as filenamify from 'filenamify';
import FFMpegDownloadWorker from 'worker-loader!../../../../utils/worker/FFMpegDownload.worker';
import Header from '../../../../components/Header/Header';
import { requestLiveRoomInfo } from '../../services/pocket48';
import {
  reqLiveList,
  setAddLiveChildList,
  setDeleteLiveChildList,
  setAutoGrab,
  idbGetPocket48LiveOptions,
  Pocket48InitialState
} from '../../reducers/pocket48';
import { rStr, getFFmpeg, getFileTime } from '../../../../utils/utils';
import { getNetMediaServerPort, NetMediaServerPort } from '../../../../utils/nodeMediaServer/nodeMediaServer';
import downloadImages from './downloadImages/downloadImages';
import autoGrab from './autoGrab';
import { OPTIONS_NAME } from '../LiveOptions/LiveOptions';
import type { WebWorkerChildItem, MessageEventData } from '../../../../types';
import type { Pocket48LiveAutoGrabOptions } from '../../types';
import type { LiveInfo, LiveRoomInfo } from '../../services/interface';

/* redux selector */
type RSelector = Pick<Pocket48InitialState, 'liveList' | 'liveChildList' | 'autoGrabTimer'>;

const selector: Selector<any, RSelector> = createStructuredSelector({
  // 直播列表
  liveList: createSelector(
    ({ pocket48 }: { pocket48: Pocket48InitialState }): Array<LiveInfo> => pocket48.liveList,
    (data: Array<LiveInfo>): Array<LiveInfo> => data
  ),
  // 直播下载
  liveChildList: createSelector(
    ({ pocket48 }: { pocket48: Pocket48InitialState }): Array<WebWorkerChildItem> => pocket48.liveChildList,
    (data: Array<WebWorkerChildItem>): Array<WebWorkerChildItem> => data
  ),
  // 自动抓取的定时器
  autoGrabTimer: createSelector(
    ({ pocket48 }: { pocket48: Pocket48InitialState }): number | null => pocket48.autoGrabTimer,
    (data: number | null): number | null => data
  )
});

/* 直播抓取 */
function Pocket48Live(props: {}): ReactElement {
  const { liveList, liveChildList, autoGrabTimer }: RSelector = useSelector(selector);
  const dispatch: Dispatch = useDispatch();
  const [loading, setLoading]: [boolean, D<S<boolean>>] = useState(false); // 加载loading

  // 停止自动抓取
  function handleStopAutoGrabClick(event: MouseEvent<HTMLButtonElement>): void {
    dispatch(setAutoGrab(null));
    message.info('停止自动抓取。');
  }

  // 开始自动抓取
  async function handleStartAutoGrabClick(event: MouseEvent<HTMLButtonElement>): Promise<void> {
    // 获取配置
    const result: { query: string; result?: { name: string; value: Pocket48LiveAutoGrabOptions } }
      = await dispatch(idbGetPocket48LiveOptions({ query: OPTIONS_NAME }));

    if (!result.result) {
      return message.warn('请先配置自动抓取相关配置。');
    }

    // 格式化配置数据
    const usersArr: string[] = result.result.value.users
      .split(/\s*[,，]\s*/i)
      .filter((o: string): boolean => o !== '');

    if (usersArr.length === 0) {
      return message.warn('请先配置自动抓取监听的成员直播。');
    }

    message.info('开始自动抓取。');
    autoGrab(result.result.value.dir, usersArr);
    dispatch(setAutoGrab(
      setInterval(autoGrab, result.result.value.time * 60_000, result.result.value.dir, usersArr)
    ));
  }

  // 下载图片
  async function handleDownloadImagesClick(record: LiveInfo, event: MouseEvent<HTMLButtonElement>): Promise<void> {
    const resInfo: LiveRoomInfo = await requestLiveRoomInfo(record.liveId);

    downloadImages(record, record.coverPath, resInfo.content?.carousels?.carousels);
  }

  // 停止
  function handleStopClick(record: LiveInfo, event: MouseEvent<HTMLButtonElement>): void {
    const index: number = findIndex(liveChildList, { id: record.liveId });

    if (index >= 0) {
      liveChildList[index].worker.postMessage({ type: 'stop' });
    }
  }

  // 录制
  async function handleGetVideoClick(record: LiveInfo, event: MouseEvent<HTMLButtonElement>): Promise<void> {
    try {
      const time: string = getFileTime(record.ctime);
      const result: SaveDialogReturnValue = await dialog.showSaveDialog({
        defaultPath: `[口袋48直播]${ record.userInfo.nickname }_${ filenamify(record.title) }_${ time }.flv`
      });

      if (result.canceled || !result.filePath) return;

      const resInfo: LiveRoomInfo = await requestLiveRoomInfo(record.liveId);
      const worker: Worker = new FFMpegDownloadWorker();

      worker.addEventListener('message', function(event1: MessageEvent<MessageEventData>) {
        const { type, error }: MessageEventData = event1.data;

        if (type === 'close' || type === 'error') {
          if (type === 'error') {
            message.error(`视频：${ record.title } 下载失败！`);
          }

          worker.terminate();
          dispatch(setDeleteLiveChildList(record));
        }
      }, false);

      worker.postMessage({
        type: 'start',
        playStreamPath: resInfo.content.playStreamPath,
        filePath: result.filePath,
        ffmpeg: getFFmpeg()
      });

      dispatch(setAddLiveChildList({
        id: record.liveId,
        worker
      }));
    } catch (err) {
      console.error(err);
      message.error('直播录制失败！');
    }
  }

  // 打开新窗口播放视频
  function handleOpenPlayerClick(record: LiveInfo, event: MouseEvent<HTMLButtonElement>): void {
    const randomId: string = rStr(30);
    const port: NetMediaServerPort = getNetMediaServerPort();
    const query: string = querystring.stringify(Object.assign(
      {
        id: randomId, // rtmp服务器id
        ...port       // 端口号
      },
      pick(record, [
        'coverPath', // 头像
        'title',     // 直播间标题
        'liveId',    // 直播id
        'liveType'   // 直播类型
      ])
    ));

    ipcRenderer.send('player.html', record.title, query);
  }

  // 点击刷新直播列表
  async function handleRefreshLiveListClick(event: MouseEvent<HTMLButtonElement>): Promise<void> {
    setLoading(true);

    try {
      await dispatch<any>(reqLiveList());
    } catch (err) {
      message.error('直播列表加载失败！');
      console.error(err);
    }

    setLoading(false);
  }

  const columns: ColumnsType<LiveInfo> = [
    { title: '标题', dataIndex: 'title' },
    { title: '成员', dataIndex: ['userInfo', 'nickname'] },
    {
      title: '类型',
      dataIndex: 'liveType',
      render: (value: 1 | 2, record: LiveInfo, index: number): ReactElement => value === 2
        ? <Tag color="volcano">电台</Tag> : <Tag color="purple">视频</Tag>
    },
    {
      title: '时间',
      dataIndex: 'ctime',
      render: (value: string, record: LiveInfo, index: number): string => dayjs(Number(value)).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: '操作',
      key: 'action',
      width: 250,
      render: (value: undefined, record: LiveInfo, index: number): ReactElement => {
        const idx: number = findIndex(liveChildList, { id: record.liveId });

        return (
          <Button.Group>
            {
              idx >= 0 ? (
                <Button type="primary"
                  danger={ true }
                  onClick={ (event: MouseEvent<HTMLButtonElement>): void => handleStopClick(record, event) }
                >
                  停止
                </Button>
              ) : (
                <Button onClick={ (event: MouseEvent<HTMLButtonElement>): Promise<void> => handleGetVideoClick(record, event) }>
                  录制
                </Button>
              )
            }
            <Button onClick={ (event: MouseEvent<HTMLButtonElement>): void => handleOpenPlayerClick(record, event) }>
              播放
            </Button>
            <Button onClick={ (event: MouseEvent<HTMLButtonElement>): Promise<void> => handleDownloadImagesClick(record, event) }>
              下载图片
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
          <Button type="primary" onClick={ handleRefreshLiveListClick }>刷新列表</Button>
          {
            typeof autoGrabTimer === 'number'
              ? <Button type="primary" danger={ true } onClick={ handleStopAutoGrabClick }>停止自动抓取</Button>
              : <Button onClick={ handleStartAutoGrabClick }>开始自动抓取</Button>
          }
          <Link to="/48/LiveOptions">
            <Button>自动抓取配置</Button>
          </Link>
        </Button.Group>
      </Header>
      <Table size="middle"
        columns={ columns }
        dataSource={ liveList }
        bordered={ true }
        loading={ loading }
        rowKey="liveId"
        pagination={{
          showQuickJumper: true
        }}
      />
    </Fragment>
  );
}

export default Pocket48Live;