import * as querystring from 'querystring';
import { ipcRenderer } from 'electron';
import { Fragment, useState, ReactElement, Dispatch as D, SetStateAction as S, MouseEvent } from 'react';
import type { Dispatch } from 'redux';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector, createStructuredSelector, Selector } from 'reselect';
import { Link } from 'react-router-dom';
import { Button, message, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import style from '../index.sass';
import { requestLiveList, requestLiveRoomInfo } from '../services/services';
import { setLiveList, L48InitialState } from '../reducers/reducers';
import { rStr } from '../../../utils/utils';
import type { LiveData, LiveInfo } from '../types';

/* state */
interface SelectorRData {
  liveList: Array<LiveInfo>;
}

const state: Selector<any, SelectorRData> = createStructuredSelector({
  // 直播列表
  liveList: createSelector(
    ({ l48 }: { l48: L48InitialState }): Array<LiveInfo> => l48.liveList,
    (data: Array<LiveInfo>): Array<LiveInfo> => data
  )
});

/* 直播抓取 */
function Live(props: {}): ReactElement {
  const { liveList }: SelectorRData = useSelector(state);
  const dispatch: Dispatch = useDispatch();
  const [loading, setLoading]: [boolean, D<S<boolean>>] = useState(false); // 加载loading

  // 打开新窗口播放视频
  function handleOpenPlayerClick(record: LiveInfo, event: MouseEvent<HTMLButtonElement>): void {
    const randomId: string = rStr(30);
    const query: string = querystring.stringify({
      coverPath: record.coverPath, // 头像
      title: record.title,         // 直播间标题
      liveId: record.liveId,       // 直播id
      id: randomId                 // rtmp服务器id
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
        return (
          <Button.Group>
            <Button onClick={ (event: MouseEvent<HTMLButtonElement>): void => handleOpenPlayerClick(record, event) }>播放</Button>
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