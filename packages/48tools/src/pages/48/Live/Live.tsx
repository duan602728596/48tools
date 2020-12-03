import * as querystring from 'querystring';
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import { ipcRenderer, remote, SaveDialogReturnValue } from 'electron';
import { Fragment, useState, ReactElement, Dispatch as D, SetStateAction as S, MouseEvent } from 'react';
import type { Dispatch, Store } from 'redux';
import { useStore, useSelector, useDispatch } from 'react-redux';
import { createSelector, createStructuredSelector, Selector } from 'reselect';
import { Link } from 'react-router-dom';
import { Button, message, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { findIndex } from 'lodash';
import style from '../index.sass';
import { requestLiveList, requestLiveRoomInfo } from '../services/services';
import { setLiveList, setLiveChildList, LiveChildItem, L48InitialState } from '../reducers/reducers';
import { rStr, getFFmpeg } from '../../../utils/utils';
import type { LiveData, LiveInfo, LiveRoomInfo } from '../types';

/* state */
const state: Selector<any, L48InitialState> = createStructuredSelector({
  // 直播列表
  liveList: createSelector(
    ({ l48 }: { l48: L48InitialState }): Array<LiveInfo> => l48.liveList,
    (data: Array<LiveInfo>): Array<LiveInfo> => data
  ),

  // 直播下载
  liveChildList: createSelector(
    ({ l48 }: { l48: L48InitialState }): Array<LiveChildItem> => l48.liveChildList,
    (data: Array<LiveChildItem>): Array<LiveChildItem> => data
  )
});

/* 直播抓取 */
function Live(props: {}): ReactElement {
  const { liveList, liveChildList }: L48InitialState = useSelector(state);
  const store: Store = useStore();
  const dispatch: Dispatch = useDispatch();
  const [loading, setLoading]: [boolean, D<S<boolean>>] = useState(false); // 加载loading

  // 停止
  function handleStopClick(record: LiveInfo, event: MouseEvent<HTMLButtonElement>): void {
    const index: number = findIndex(liveChildList, { id: record.liveId });

    if (index >= 0) {
      liveChildList[index].child.kill('SIGTERM');
    }
  }

  // 停止后的回调函数
  function endCallback(record: LiveInfo): void {
    const list: Array<LiveChildItem> = [...store.getState().l48.liveChildList];
    const index: number = findIndex(list, { id: record.liveId });

    if (index >= 0) {
      list.splice(index, 1);
      dispatch(setLiveChildList([...list]));
    }
  }

  // 录制
  async function handleGetVideoClick(record: LiveInfo, event: MouseEvent<HTMLButtonElement>): Promise<void> {
    const result: SaveDialogReturnValue = await remote.dialog.showSaveDialog({
      defaultPath: `${ record.userInfo.nickname }_${ record.liveId }.flv`
    });

    if (result.canceled || !result.filePath) return;

    const resInfo: LiveRoomInfo = await requestLiveRoomInfo(record.liveId);
    const cs: ChildProcessWithoutNullStreams = spawn(getFFmpeg(), [
      '-i',
      `${ resInfo.content.playStreamPath }`,
      '-c',
      'copy',
      result.filePath
    ]);

    cs.stdout.on('data', function(data: Buffer): void {
      // console.log(data.toString());
    });

    cs.stderr.on('data', function(data: Buffer): void {
      // console.log(data.toString());
    });

    cs.on('close', function(...args: string[]): void {
      console.log(...args);
      endCallback(record);
    });

    cs.on('error', function(err: Error): void {
      message.error(`视频：${ record.title } 下载失败！`);
      endCallback(record);
    });

    dispatch(setLiveChildList(
      liveChildList.concat([{
        id: record.liveId,
        child: cs
      }])
    ));
  }

  // 打开新窗口播放视频
  function handleOpenPlayerClick(record: LiveInfo, event: MouseEvent<HTMLButtonElement>): void {
    const randomId: string = rStr(30);
    const query: string = querystring.stringify({
      coverPath: record.coverPath, // 头像
      title: record.title,         // 直播间标题
      liveId: record.liveId,       // 直播id
      id: randomId,                // rtmp服务器id
      liveType: record.liveType    // 直播类型
    });

    ipcRenderer.send('player.html', record.title, query);
  }

  // 点击刷新直播列表
  async function handleRefreshLiveListClick(event: MouseEvent<HTMLButtonElement>): Promise<void> {
    setLoading(true);

    try {
      const res: LiveData = await requestLiveList(0, true);

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
      title: '操作',
      key: 'action',
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
          </Button.Group>
        );
      }
    }
  ];

  return (
    <Fragment>
      <header className={ style.header }>
        <div className={ style.headerLeft }>
          <Link to="/">
            <Button type="primary" danger={ true }>返回</Button>
          </Link>
        </div>
        <div>
          <Button onClick={ handleRefreshLiveListClick }>刷新列表</Button>
        </div>
      </header>
      <Table size="middle" columns={ columns } dataSource={ liveList } bordered={ true } loading={ loading } rowKey="liveId" />
    </Fragment>
  );
}

export default Live;