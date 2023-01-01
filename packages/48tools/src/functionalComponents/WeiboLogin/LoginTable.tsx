import { useEffect, type ReactElement, type MouseEvent } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { createStructuredSelector, type Selector } from 'reselect';
import { Table, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { IDBCursorAccountList, IDBDeleteAccount, WeiboLoginInitialState } from './reducers/weiboLogin';
import dbConfig from '../../utils/IDB/IDBConfig';
import type { WeiboAccount } from '../../commonTypes';

/* redux selector */
type RState = { weiboLogin: WeiboLoginInitialState };

const selector: Selector<RState, WeiboLoginInitialState> = createStructuredSelector({
  // 微博已登陆账号
  accountList: ({ weiboLogin }: RState): Array<WeiboAccount> => weiboLogin.accountList
});

/* 已登陆列表 */
function LoginTable(props: {}): ReactElement {
  const { accountList }: WeiboLoginInitialState = useSelector(selector);
  const dispatch: Dispatch = useDispatch();

  // 删除账号
  function handleDeleteWeiboAccountClick(record: WeiboAccount, event: MouseEvent): void {
    dispatch(IDBDeleteAccount({
      query: record.id
    }));
  }

  const columns: ColumnsType<WeiboAccount> = [
    { title: 'ID', dataIndex: 'id', width: 150 },
    { title: '昵称', dataIndex: 'username' },
    { title: '上次登陆时间', dataIndex: 'lastLoginTime', width: 180 },
    {
      title: '操作',
      key: 'handle',
      width: 65,
      render: (value: void, record: WeiboAccount, index: number): ReactElement => (
        <Button type="primary"
          size="small"
          danger={ true }
          onClick={ (event: MouseEvent): void => handleDeleteWeiboAccountClick(record, event) }
        >
          删除
        </Button>
      )
    }
  ];

  useEffect(function(): void {
    dispatch(IDBCursorAccountList({
      query: {
        indexName: dbConfig.objectStore[3].data[0]
      }
    }));
  }, []);

  return (
    <Table size="small"
      columns={ columns }
      bordered={ true }
      dataSource={ accountList }
      rowKey="id"
      scroll={{ y: 280 }}
      pagination={{
        showQuickJumper: true
      }}
    />
  );
}

export default LoginTable;