import { Fragment, ReactElement, MouseEvent } from 'react';
import { useSelector } from 'react-redux';
import { createSelector, createStructuredSelector, Selector } from 'reselect';
import { Table, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import Header from '../../../components/Header/Header';
import GetLiveUrl from './GetLiveUrl';
import type { Live48InitialState } from '../reducers/live48';
import type{ InLiveWebWorkerItem } from '../types';

/* state */
type RSelector = Pick<Live48InitialState, 'inLiveList'>;

const state: Selector<any, RSelector> = createStructuredSelector({
  // 公演直播列表
  inLiveList: createSelector(
    ({ live48 }: { live48: Live48InitialState }): Array<InLiveWebWorkerItem> => live48.inLiveList,
    (data: Array<InLiveWebWorkerItem>): Array<InLiveWebWorkerItem> => data
  )
});

/* 官网公演直播抓取 */
function Live48(props: {}): ReactElement {
  const { inLiveList }: RSelector = useSelector(state);

  // 停止
  function handleStopClick(item: InLiveWebWorkerItem, event: MouseEvent<HTMLButtonElement>): void {
    item.worker.postMessage({ type: 'stop' });
  }

  const columns: ColumnsType<InLiveWebWorkerItem> = [
    { title: '团体', dataIndex: 'type' },
    { title: '直播ID', dataIndex: 'live' },
    { title: '画质', dataIndex: 'quality' },
    {
      title: '操作',
      key: 'handle',
      width: 80,
      render: (value: undefined, record: InLiveWebWorkerItem, index: number): ReactElement => (
        <Button type="primary"
          danger={ true }
          onClick={ (event: MouseEvent<HTMLButtonElement>): void => handleStopClick(record, event) }
        >
          停止
        </Button>
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

export default Live48;