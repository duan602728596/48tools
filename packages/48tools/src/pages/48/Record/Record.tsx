import * as path from 'path';
import type { ParsedPath } from 'path';
import { remote, SaveDialogReturnValue } from 'electron';
import { Fragment, useState, ReactElement, Dispatch as D, SetStateAction as S, MouseEvent } from 'react';
import type { Dispatch, Store } from 'redux';
import { useStore, useSelector, useDispatch } from 'react-redux';
import { createSelector, createStructuredSelector, Selector } from 'reselect';
import { Link } from 'react-router-dom';
import { Button, message, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import * as moment from 'moment';
import style from '../index.sass';
import { setRecordList, L48InitialState } from '../reducers/reducers';
import { requestLiveList, requestLiveRoomInfo, requestDownloadLrc } from '../services/services';
import type { LiveData, LiveInfo, LiveRoomInfo } from '../types';

/* state */
type RSelector = Pick<L48InitialState, 'recordList' | 'recordNext'>;

const state: Selector<any, RSelector> = createStructuredSelector({
  // 录播信息
  recordList: createSelector(
    ({ l48 }: { l48: L48InitialState }): Array<LiveInfo> => l48.recordList,
    (data: Array<LiveInfo>): Array<LiveInfo> => data
  ),

  // 记录录播分页位置
  recordNext: createSelector(
    ({ l48 }: { l48: L48InitialState }): string => l48.recordNext,
    (data: string): string => data
  )
});

/* 录播列表 */
function Record(props: {}): ReactElement {
  const { recordList, recordNext }: RSelector = useSelector(state);
  const store: Store = useStore();
  const dispatch: Dispatch = useDispatch();
  const [loading, setLoading]: [boolean, D<S<boolean>>] = useState(false); // 加载loading

  // 下载弹幕
  async function handleDownloadLrc(record: LiveInfo, event: MouseEvent<HTMLButtonElement>): Promise<void> {
    try {
      const res: LiveRoomInfo = await requestLiveRoomInfo(record.liveId);
      const { base }: ParsedPath = path.parse(res.content.msgFilePath);
      const result: SaveDialogReturnValue = await remote.dialog.showSaveDialog({
        defaultPath: base
      });

      if (result.canceled || !result.filePath) return;

      await requestDownloadLrc(res.content.msgFilePath, result.filePath);
      message.success('弹幕文件下载成功！');
    } catch (err) {
      message.error('弹幕文件下载失败！');
      console.error(err);
    }
  }

  // 加载列表
  async function handleLoadRecordListClick(event: MouseEvent<HTMLButtonElement>): Promise<void> {
    setLoading(true);

    try {
      const res: LiveData = await requestLiveList(recordNext, false);
      const data: Array<LiveInfo> = recordList.concat(res.content.liveList);

      dispatch(setRecordList({
        next: res.content.next,
        data
      }));
    } catch (err) {
      message.error('录播列表加载失败！');
      console.error(err);
    }

    setLoading(false);
  }

  // 刷新列表
  async function handleRefreshLiveListClick(event: MouseEvent<HTMLButtonElement>): Promise<void> {
    setLoading(true);

    try {
      const res: LiveData = await requestLiveList('0', false);

      dispatch(setRecordList({
        next: res.content.next,
        data: res.content.liveList
      }));
    } catch (err) {
      message.error('录播列表加载失败！');
      console.error(err);
    }

    setLoading(false);
  }

  // 渲染分页
  function showTotalRender(total: number, range: [number, number]): ReactElement {
    return <Button size="small" onClick={ handleLoadRecordListClick }>加载列表</Button>;
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
      render: (value: string, record: LiveInfo, index: number): string => {
        return moment(Number(value)).format('YYYY-MM-DD HH:mm:ss');
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (value: undefined, record: LiveInfo, index: number): ReactElement => {
        return (
          <Button.Group>
            <Button onClick={ (event: MouseEvent<HTMLButtonElement>): Promise<void> => handleDownloadLrc(record, event) }>
              下载弹幕
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
          <Button.Group>
            <Button onClick={ handleLoadRecordListClick }>加载列表</Button>
            <Button onClick={ handleRefreshLiveListClick }>刷新列表</Button>
          </Button.Group>
        </div>
      </header>
      <Table size="middle"
        columns={ columns }
        dataSource={ recordList }
        bordered={ true }
        loading={ loading }
        rowKey="liveId"
        pagination={{
          showQuickJumper: true,
          showTotal: showTotalRender
        }}
      />
    </Fragment>
  );
}

export default Record;