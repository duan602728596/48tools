import { useEffect, ReactElement, MouseEvent } from 'react';
import type { Dispatch } from 'redux';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector, createStructuredSelector, Selector } from 'reselect';
import { Table, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { idbCursorAccountList, idbDeleteAccount, WeiboLoginInitialState } from './reducers/weiboLogin';
import dbConfig from '../../utils/idb/dbConfig';
import type { WeiboAccount } from '../../types';

/* redux selector */
const selector: Selector<any, WeiboLoginInitialState> = createStructuredSelector({
  // 微博已登陆账号
  accountList: createSelector(
    ({ weiboLogin }: { weiboLogin: WeiboLoginInitialState }): Array<WeiboAccount> => weiboLogin.accountList,
    (data: Array<WeiboAccount>): Array<WeiboAccount> => data
  )
});

/* 已登陆列表 */
function LoginTable(props: {}): ReactElement {
  const { accountList }: WeiboLoginInitialState = useSelector(selector);
  const dispatch: Dispatch = useDispatch();

  // 删除账号
  function handleDeleteWeiboAccountClick(record: WeiboAccount, event: MouseEvent<HTMLButtonElement>): void {
    dispatch(idbDeleteAccount({
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
          onClick={ (event: MouseEvent<HTMLButtonElement>): void => handleDeleteWeiboAccountClick(record, event) }
        >
          删除
        </Button>
      )
    }
  ];

  useEffect(function(): void {
    dispatch(idbCursorAccountList({
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
      scroll={{ y: 300 }}
      pagination={{
        showQuickJumper: true
      }}
    />
  );
}

export default LoginTable;