import { Fragment, ReactElement, useEffect, MouseEvent } from 'react';
import type { Dispatch } from 'redux';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector, createStructuredSelector, Selector } from 'reselect';
import { Link } from 'react-router-dom';
import { Button, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import style from '../../48/index.sass';
import AddForm from './AddForm';
import { cursorFormData, deleteFormData, BilibiliInitialState } from '../reducers/reducers';
import dbConfig from '../../../utils/idb/dbConfig';
import type { LiveItem } from '../types';

/* state */
type RSelector = Pick<BilibiliInitialState, 'bilibiliLiveList'>;

const state: Selector<any, RSelector> = createStructuredSelector({
  // 直播间列表
  bilibiliLiveList: createSelector(
    ({ bilibili }: { bilibili: BilibiliInitialState }): Array<LiveItem> => bilibili.bilibiliLiveList,
    (data: Array<LiveItem>): Array<LiveItem> => data
  )
});

/* 直播抓取 */
function Live(props: {}): ReactElement {
  const { bilibiliLiveList }: RSelector = useSelector(state);
  const dispatch: Dispatch = useDispatch();

  // 删除
  function handleDeleteRoomIdClick(record: LiveItem, event: MouseEvent<HTMLButtonElement>): void {
    dispatch(deleteFormData({
      query: record.id
    }));
  }

  const columns: ColumnsType<LiveItem> = [
    { title: '说明', dataIndex: 'description' },
    { title: '房间ID', dataIndex: 'roomId' },
    {
      title: '操作',
      key: 'handle',
      width: 155,
      render: (value: undefined, record: LiveItem, index: number): ReactElement => {
        return (
          <Button.Group>
            <Button>开始录制</Button>
            <Button type="primary"
              danger={ true }
              onClick={ (event: MouseEvent<HTMLButtonElement>): void => handleDeleteRoomIdClick(record, event) }
            >
              删除
            </Button>
          </Button.Group>
        );
      }
    }
  ];

  useEffect(function(): void {
    dispatch(cursorFormData({
      query: { indexName: dbConfig.objectStore[0].data[1] }
    }));
  }, []);

  return (
    <Fragment>
      <header className={ style.header }>
        <div className={ style.headerLeft }>
          <Link to="/">
            <Button type="primary" danger={ true }>返回</Button>
          </Link>
        </div>
        <div>
          <AddForm />
        </div>
      </header>
      <Table size="middle"
        columns={ columns }
        dataSource={ bilibiliLiveList }
        bordered={ true }
        rowKey={ dbConfig.objectStore[0].key }
        pagination={{
          showQuickJumper: true
        }}
      />
    </Fragment>
  );
}

export default Live;