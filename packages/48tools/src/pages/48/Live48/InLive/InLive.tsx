import { Fragment, type ReactElement, type MouseEvent } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { createStructuredSelector, type Selector } from 'reselect';
import { Table, Button, Tag, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import Header from '../../../../components/Header/Header';
import GetLiveUrl from './GetLiveUrl';
import { setDeleteInLiveList, setStopInLiveList, type Live48InitialState } from '../../reducers/live48';
import type { InLiveWebWorkerItem } from '../../types';

/* redux selector */
type RSelector = Pick<Live48InitialState, 'inLiveList'>;
type RState = { live48: Live48InitialState };

const selector: Selector<RState, RSelector> = createStructuredSelector({
  // 公演直播列表
  inLiveList: ({ live48 }: RState): Array<InLiveWebWorkerItem> => live48.inLiveList
});

/* 官网公演直播抓取 */
function InLive(props: {}): ReactElement {
  const { inLiveList }: RSelector = useSelector(selector);
  const dispatch: Dispatch = useDispatch();

  // 删除
  function handleDeleteClick(item: InLiveWebWorkerItem, event: MouseEvent<HTMLButtonElement>): void {
    dispatch(setDeleteInLiveList(item.id));
  }

  // 停止
  function handleStopClick(item: InLiveWebWorkerItem, event: MouseEvent<HTMLButtonElement>): void {
    item.timer && clearInterval(item.timer);

    if (item.worker) {
      item.worker.postMessage({ type: 'stop' });
    } else {
      dispatch(setStopInLiveList(item.id));
    }
  }

  const columns: ColumnsType<InLiveWebWorkerItem> = [
    { title: '团体', dataIndex: 'type' },
    { title: '直播ID', dataIndex: 'live' },
    {
      title: '画质',
      dataIndex: 'quality',
      render: (value: string, record: InLiveWebWorkerItem, index: number): string => {
        switch (value) {
          case 'chao':
            return '超清';

          case 'gao':
            return '高清';

          case 'liuchang':
            return '流畅';

          default:
            return value;
        }
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (value: number | undefined, record: InLiveWebWorkerItem, index: number): ReactElement => value === 0
        ? <Tag color="red">已停止</Tag>
        : (record.worker ? <Tag color="cyan">录制中</Tag> : <Tag color="lime">等待录制</Tag>)
    },
    {
      title: '操作',
      key: 'handle',
      width: 150,
      render: (value: undefined, record: InLiveWebWorkerItem, index: number): ReactElement => record.status === 0 ? (
        <Button type="primary"
          danger={ true }
          onClick={ (event: MouseEvent<HTMLButtonElement>): void => handleDeleteClick(record, event) }
        >
          删除
        </Button>
      ) : (
        <Popconfirm title="确定要停止录制吗？"
          onConfirm={ (event: MouseEvent<HTMLButtonElement>): void => handleStopClick(record, event) }
        >
          <Button type="primary" danger={ true }>停止</Button>
        </Popconfirm>

      )
    }
  ];

  return (
    <Fragment>
      <Header>
        <GetLiveUrl />
      </Header>
      <Table size="middle"
        columns={ columns }
        dataSource={ inLiveList }
        bordered={ true }
        rowKey="id"
        pagination={{
          showQuickJumper: true
        }}
      />
    </Fragment>
  );
}

export default InLive;