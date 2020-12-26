import * as querystring from 'querystring';
import { ipcRenderer, remote, SaveDialogReturnValue } from 'electron';
import { Fragment, useState, ReactElement, Dispatch as D, SetStateAction as S, MouseEvent } from 'react';
import type { Dispatch, Store } from 'redux';
import { useStore, useSelector, useDispatch } from 'react-redux';
import { createSelector, createStructuredSelector, Selector } from 'reselect';
import { Button, message, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { findIndex, pick } from 'lodash';
import * as moment from 'moment';
import FFMpegDownloadWorker from 'worker-loader!../../../utils/worker/FFMpegDownload.Worker';
import type { MessageEventData } from '../../../utils/worker/FFMpegDownload.Worker';
import Header from '../../../components/Header/Header';
import { requestLiveList, requestLiveRoomInfo } from '../services/pocket48';
import { setLiveList, setLiveChildList, Pocket48InitialState } from '../reducers/pocket48';
import { rStr, getFFmpeg } from '../../../utils/utils';
import { getNetMediaServerPort, NetMediaServerPort } from '../../../utils/nodeMediaServer/nodeMediaServer';
import downloadImages from './downloadImages';
import type { WebWorkerChildItem } from '../../../types';
import type { LiveData, LiveInfo, LiveRoomInfo } from '../services/interface';

/* state */
type RSelector = Pick<Pocket48InitialState, 'liveList' | 'liveChildList'>;

const state: Selector<any, RSelector> = createStructuredSelector({
  // 直播列表
  liveList: createSelector(
    ({ pocket48 }: { pocket48: Pocket48InitialState }): Array<LiveInfo> => pocket48.liveList,
    (data: Array<LiveInfo>): Array<LiveInfo> => data
  ),

  // 直播下载
  liveChildList: createSelector(
    ({ pocket48 }: { pocket48: Pocket48InitialState }): Array<WebWorkerChildItem> => pocket48.liveChildList,
    (data: Array<WebWorkerChildItem>): Array<WebWorkerChildItem> => data
  )
});

/* 直播抓取 */
function Pocket48Live(props: {}): ReactElement {
  const { liveList, liveChildList }: RSelector = useSelector(state);
  const store: Store = useStore();
  const dispatch: Dispatch = useDispatch();
  const [loading, setLoading]: [boolean, D<S<boolean>>] = useState(false); // 加载loading

  // 下载图片
  async function handleDownloadImagesClick(record: LiveInfo, event: MouseEvent<HTMLButtonElement>): Promise<void> {
    const resInfo: LiveRoomInfo = await requestLiveRoomInfo(record.liveId);

    downloadImages(record.coverPath, resInfo.content?.carousels?.carousels);
  }

  // 停止
  function handleStopClick(record: LiveInfo, event: MouseEvent<HTMLButtonElement>): void {
    const index: number = findIndex(liveChildList, { id: record.liveId });

    if (index >= 0) {
      liveChildList[index].worker.postMessage({ type: 'stop' });
    }
  }

  // 停止后的回调函数
  function endCallback(record: LiveInfo): void {
    const list: Array<WebWorkerChildItem> = [...store.getState().pocket48.liveChildList];
    const index: number = findIndex(list, { id: record.liveId });

    if (index >= 0) {
      list.splice(index, 1);
      dispatch(setLiveChildList([...list]));
    }
  }

  // 录制
  async function handleGetVideoClick(record: LiveInfo, event: MouseEvent<HTMLButtonElement>): Promise<void> {
    try {
      const result: SaveDialogReturnValue = await remote.dialog.showSaveDialog({
        defaultPath: `[口袋48直播]${ record.userInfo.nickname }_${ record.liveId }.flv`
      });

      if (result.canceled || !result.filePath) return;

      const resInfo: LiveRoomInfo = await requestLiveRoomInfo(record.liveId);
      const worker: Worker = new FFMpegDownloadWorker();

      worker.addEventListener('message', function(event: MessageEvent<MessageEventData>) {
        const { type, error }: MessageEventData = event.data;

        if (type === 'close' || type === 'error') {
          if (type === 'error') {
            message.error(`视频：${ record.title } 下载失败！`);
          }

          worker.terminate();
          endCallback(record);
        }
      }, false);

      worker.postMessage({
        type: 'start',
        playStreamPath: resInfo.content.playStreamPath,
        filePath: result.filePath,
        ffmpeg: getFFmpeg()
      });

      dispatch(setLiveChildList(
        liveChildList.concat([{
          id: record.liveId,
          worker
        }])
      ));
    } catch (err) {
      console.error(err);
      message.error('直播录制失败！');
    }
  }

  // 打开新窗口播放视频
  async function handleOpenPlayerClick(record: LiveInfo, event: MouseEvent<HTMLButtonElement>): Promise<void> {
    const randomId: string = rStr(30);
    const port: NetMediaServerPort = await getNetMediaServerPort();
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
      const res: LiveData = await requestLiveList('0', true);

      dispatch(setLiveList(res.content.liveList));
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
      render: (value: string, record: LiveInfo, index: number): string => moment(Number(value)).format('YYYY-MM-DD HH:mm:ss')
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
            <Button onClick={ (event: MouseEvent<HTMLButtonElement>): Promise<void> => handleOpenPlayerClick(record, event) }>
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
        <Button onClick={ handleRefreshLiveListClick }>刷新列表</Button>
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