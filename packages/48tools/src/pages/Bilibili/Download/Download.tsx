import { Fragment, ReactElement, MouseEvent } from 'react';
import type { Dispatch } from 'redux';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector, createStructuredSelector, Selector } from 'reselect';
import { Link } from 'react-router-dom';
import { Button, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { findIndex } from 'lodash';
import style from '../../48/index.sass';
import AddForm from './AddForm';
import { setDownloadList, BilibiliInitialState } from '../reducers/reducers';
import type { DownloadItem } from '../types';

/* state */
type RSelector = Pick<BilibiliInitialState, 'downloadList'>;

const state: Selector<any, BilibiliInitialState> = createStructuredSelector({
  downloadList: createSelector(
    ({ bilibili }: { bilibili: BilibiliInitialState }): Array<DownloadItem> => bilibili.downloadList,
    (data: Array<DownloadItem>): Array<DownloadItem> => data
  )
});

/* 视频下载 */
function Download(props: {}): ReactElement {
  const { downloadList }: RSelector = useSelector(state);
  const dispatch: Dispatch = useDispatch();

  // 删除一个任务
  function handleDeleteTaskClick(item: DownloadItem, event: MouseEvent<HTMLButtonElement>): void {
    const index: number = findIndex(downloadList, { qid: item.qid });

    if (index >= 0) {
      const newList: Array<DownloadItem> = [...downloadList];

      newList.splice(index, 1);
      dispatch(setDownloadList(newList));
    }
  }

  const columns: ColumnsType<DownloadItem> = [
    { title: 'ID', dataIndex: 'id' },
    { title: '下载类型', dataIndex: 'type' },
    { title: '分页', dataIndex: 'page' },
    {
      title: '操作',
      key: 'action',
      render: (value: undefined, record: DownloadItem, index: number): ReactElement => {
        return (
          <Button.Group>
            <Button type="primary"
              danger={ true }
              onClick={ (event: MouseEvent<HTMLButtonElement>): void => handleDeleteTaskClick(record, event) }
            >
              删除
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
          <AddForm />
        </div>
      </header>
      <Table size="middle"
        columns={ columns }
        dataSource={ downloadList }
        bordered={ true }
        rowKey="qid"
        pagination={{
          showQuickJumper: true
        }}
      />
    </Fragment>
  );
}

export default Download;