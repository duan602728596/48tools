import { Fragment, useState, useEffect, type ReactElement, type MouseEvent, type Dispatch as D, type SetStateAction as S } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { Table, Button, Drawer, App, List, Avatar, Alert } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { useAppProps } from 'antd/es/app/context';
import { parse } from 'cookie';
import * as classNames from 'classnames';
import { requestVisitedList, type VisitedList, type VisitedSchemaItem } from '@48tools-api/weibo';
import { requestUserInfo, type UserInfo } from '@48tools-api/weibo/login';
import commonStyle from '../../common.sass';
import { IDBCursorAccountList, IDBDeleteAccount, WeiboLoginInitialState } from './reducers/weiboLogin';
import { weiboLoginSelector } from './reducers/selectors';
import dbConfig from '../../utils/IDB/IDBConfig';
import Follow from './Follow/Follow';
import { handleOpenWeiboClick } from './function/weiboHelper';
import type { WeiboAccount } from '../../commonTypes';

/* 已登陆列表 */
function LoginTable(props: {}): ReactElement {
  const { accountList }: WeiboLoginInitialState = useSelector(weiboLoginSelector);
  const dispatch: Dispatch = useDispatch();
  const { message: messageApi }: useAppProps = App.useApp();
  const [isDrawerVisible, setIsDrawerVisible]: [boolean, D<S<boolean>>] = useState(false); // 是否显示抽屉
  const [isFollowDrawerVisible, setFollowDrawerVisible]: [boolean, D<S<boolean>>] = useState(false); // 是否显示关注的人的抽屉
  const [checkWeiboAccount, setCheckWeiboAccount]: [WeiboAccount | undefined, D<S<WeiboAccount | undefined>>] = useState(); // 选中的账号
  const [drawerData, setDrawerData]: [Array<UserInfo>, D<S<Array<UserInfo>>>] = useState([]); // 访客数据
  const [loading, setLoading]: [boolean, D<S<boolean>>] = useState(false); // 加载状态

  // 删除账号
  function handleDeleteWeiboAccountClick(record: WeiboAccount, event: MouseEvent): void {
    dispatch(IDBDeleteAccount({
      query: record.id
    }));
  }

  // 访客(Next)
  function handleVisitorWeiboAccountNextClick(record: WeiboAccount, event: MouseEvent): void {
    setCheckWeiboAccount(record);
    setFollowDrawerVisible(true);
  }

  // 访客
  async function handleVisitorWeiboAccountClick(record: WeiboAccount, event: MouseEvent): Promise<void> {
    if (!(record.s && record.from && record.c)) {
      messageApi.warning('App相关参数为空！');

      return;
    }

    const cookie: Record<string, string> = parse(record.cookie);
    const subCookie: string | undefined = cookie.SUB;

    if (!subCookie) {
      messageApi.warning('Cookie中没有SUB字段！');

      return;
    }

    const res: VisitedList = await requestVisitedList(subCookie, record.s, record.from, record.c);

    if (res.errno || res.errmsg) {
      messageApi.error(res.errmsg ?? '访客列表获取失败！');

      return;
    }

    setIsDrawerVisible(true);
    setLoading(true);

    try {
      const visitedIdList: Array<string> = (res?.data?.data ?? [])
        .filter((o: VisitedSchemaItem | []): o is Required<VisitedSchemaItem> => {
          return !Array.isArray(o) && ('scheme' in o);
        })
        .map((o: Required<VisitedSchemaItem>): string => {
          return o.scheme.split('=')[1];
        });
      const userInfos: Array<UserInfo> = await Promise.all<UserInfo>(
        visitedIdList.map((o: string): Promise<UserInfo> => requestUserInfo(o, record.cookie))
      );

      setDrawerData(userInfos);
    } catch (err) {
      console.error(err);
      messageApi.error('加载访客列表详细信息失败！');
    }

    setLoading(false);
  }

  // 渲染访客列表
  function visitedListRenderItem(item: UserInfo): ReactElement {
    return (
      <List.Item key={ item.data.user.idstr }>
        <List.Item.Meta avatar={ <Avatar src={ item.data.user.avatar_hd } /> }
          title={
            <Button type="text" onClick={ (event: MouseEvent): void => handleOpenWeiboClick(item.data.user.idstr, event) }>
              { item.data.user.screen_name }
            </Button>
          }
          description={ item.data.user.description }
        />
      </List.Item>
    );
  }

  const columns: ColumnsType<WeiboAccount> = [
    { title: 'ID', dataIndex: 'id', width: 110 },
    { title: '昵称', dataIndex: 'username' },
    { title: '上次登陆时间', dataIndex: 'lastLoginTime', width: 110 },
    {
      title: '抓包参数',
      key: 'app',
      width: 120,
      render: (value: void, record: WeiboAccount, index: number): ReactElement => (
        <table className={ classNames('text-[12px]', commonStyle.text) }>
          <tbody>
            <tr>
              <th className="text-right">s:</th>
              <td>{record.s ?? 'None'}</td>
            </tr>
            <tr>
              <th className="text-right">from:</th>
              <td>{record.from ?? 'None'}</td>
            </tr>
            <tr>
              <th className="text-right">c:</th>
              <td>{record.c ?? 'None'}</td>
            </tr>
          </tbody>
        </table>
      )
    },
    {
      title: '操作',
      key: 'handle',
      width: 200,
      render: (value: void, record: WeiboAccount, index: number): ReactElement => {
        const disabledSeeVisitor: boolean = !(record.s && record.from && record.c);

        return (
          <Button.Group size="small">
            <Button disabled={ disabledSeeVisitor }
              onClick={ (event: MouseEvent): Promise<void> => handleVisitorWeiboAccountClick(record, event) }
            >
              访客
            </Button>
            <Button disabled={ disabledSeeVisitor }
              onClick={ (event: MouseEvent): void => handleVisitorWeiboAccountNextClick(record, event) }
            >
              关注的人
            </Button>
            <Button type="primary"
              danger={ true }
              onClick={ (event: MouseEvent): void => handleDeleteWeiboAccountClick(record, event) }
            >
              删除
            </Button>
          </Button.Group>
        );
      }
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
    <Fragment>
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
      <Drawer open={ isDrawerVisible }
        maskClosable={ false }
        mask={ false }
        closeIcon={ null }
        footer={ <Button type="primary" danger={ true } onClick={ (): void => setIsDrawerVisible(false) }>关闭</Button> }
      >
        <Alert className="mb-[6px]" type="error" message="由于限制，访客列表只能展示有限的访客。SVIP以上的用户就别在这里看了。" />
        <List size="small" bordered={ true } dataSource={ drawerData } loading={ loading } renderItem={ visitedListRenderItem } />
      </Drawer>
      <Drawer open={ isFollowDrawerVisible }
        width={ 800 }
        classNames={{ body: 'flex flex-col' }}
        maskClosable={ false }
        mask={ false }
        closeIcon={ null }
        destroyOnClose={ true }
        footer={ <Button type="primary" danger={ true } onClick={ (): void => setFollowDrawerVisible(false) }>关闭</Button> }
      >
        <Follow weiboAccount={ checkWeiboAccount! } />
      </Drawer>
    </Fragment>
  );
}

export default LoginTable;