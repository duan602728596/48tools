import { Fragment, useState, useEffect, type ReactElement, type MouseEvent, type Dispatch as D, type SetStateAction as S } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { Table, Button, Drawer, App, List, Avatar, Alert, Tag, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { useAppProps } from 'antd/es/app/context';
import { UserOutlined as IconUserOutlined } from '@ant-design/icons';
import { parse } from 'cookie';
import classNames from 'classnames';
import * as dayjs from 'dayjs';
import * as customParseFormat from 'dayjs/plugin/customParseFormat';
import { requestVisitedList, type VisitedList, type VisitedSchemaItem } from '@48tools-api/weibo';
import { requestUserInfo, type UserInfo } from '@48tools-api/weibo/login';
import commonStyle from '../../common.sass';
import { IDBCursorAccountList, IDBDeleteAccount, WeiboLoginInitialState } from './reducers/weiboLogin';
import { weiboLoginSelector } from './reducers/selectors';
import dbConfig from '../../utils/IDB/IDBConfig';
import Follow from './Follow/Follow';
import { handleOpenWeiboClick } from './function/weiboHelper';
import type { WeiboAccount } from '../../commonTypes';

dayjs.extend(customParseFormat);

/* 定义合并后的账号信息 */
interface VisitedSchemaItemWithUserInfo extends VisitedSchemaItem {
  userInfo?: UserInfo['data']['user'];
  formatSchemeString?: string;
}

/* 已登陆列表 */
function LoginTable(props: {}): ReactElement {
  const { accountList }: WeiboLoginInitialState = useSelector(weiboLoginSelector);
  const dispatch: Dispatch = useDispatch();
  const { message: messageApi }: useAppProps = App.useApp();
  const [isDrawerVisible, setIsDrawerVisible]: [boolean, D<S<boolean>>] = useState(false); // 是否显示抽屉
  const [isFollowDrawerVisible, setFollowDrawerVisible]: [boolean, D<S<boolean>>] = useState(false); // 是否显示关注的人的抽屉
  const [checkWeiboAccount, setCheckWeiboAccount]: [WeiboAccount | undefined, D<S<WeiboAccount | undefined>>] = useState(); // 选中的账号
  const [drawerData, setDrawerData]: [Array<VisitedSchemaItemWithUserInfo>, D<S<Array<VisitedSchemaItemWithUserInfo>>>] = useState([]); // 访客数据
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
      const visitedList: Array<VisitedSchemaItemWithUserInfo> = (res?.data?.data ?? [])
        .map((o: VisitedSchemaItem): VisitedSchemaItemWithUserInfo => {
          const formatSchemeString: string | undefined = o.scheme ? o.scheme.split('=')[1] : undefined;

          return Object.assign(o, { formatSchemeString });
        });

      for (const item of visitedList) {
        if (item.formatSchemeString) {
          const resUserInfo: UserInfo = await requestUserInfo(item.formatSchemeString, record.cookie);

          item.userInfo = resUserInfo.data.user;
        }
      }

      setDrawerData(visitedList);
    } catch (err) {
      console.error(err);
      messageApi.error('加载访客列表详细信息失败！');
    }

    setLoading(false);
  }

  // 渲染访客列表
  function visitedListRenderItem(item: VisitedSchemaItemWithUserInfo, index: number): ReactElement {
    const tags: Array<ReactElement> = [];

    if (item.text) tags.push(<Tag key="text" className="mt-[4px]" color="purple">{ item.text }</Tag>);

    if (item.new_status) tags.push(<Tag key="new_status" className="mt-[4px]" color="magenta">{ item.new_status }</Tag>);

    if (item.region) tags.push(<Tag key="region" className="mt-[4px]" color="red">{ item.region }</Tag>);

    if (item.sunshine) tags.push(<Tag key="sunshine" className="mt-[4px]" color="volcano">{ item.sunshine }</Tag>);

    if (item.recommend?.length) {
      item.recommend.forEach((o: { name: string; value: string }, i: number): void => {
        tags.push(
          <Tag key={ `${ o.value }_${ i }` } className="mt-[4px]">
            { (o.name && o.name !== '') ? `${ o.name }：${ o.value }` : o.value }
          </Tag>
        );
      });
    }

    const visitedDay: string = dayjs(item.visit_day, 'YYYYMMDD').format('YYYY-MM-DD');

    if (item.userInfo) {
      return (
        <List.Item key={ item.userInfo.idstr }>
          <List.Item.Meta avatar={ <Avatar src={ item.userInfo.avatar_hd } /> }
            title={
              <Button type="text" onClick={ (event: MouseEvent): void => handleOpenWeiboClick(item.userInfo!.idstr, event) }>
                { item.userInfo.screen_name }
              </Button>
            }
            description={ item.userInfo.description }
          />
          <div>访问时间：{ visitedDay }</div>
          <div>{ tags }</div>
        </List.Item>
      );
    } else {
      return (
        <List.Item key={ index }>
          <List.Item.Meta title="未知用户" avatar={ <Avatar icon={ <IconUserOutlined /> } /> } />
          <div>访问时间：{visitedDay}</div>
          <div>{ tags }</div>
        </List.Item>
      );
    }
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
          <Space.Compact size="small">
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
          </Space.Compact>
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
        <List size="small" itemLayout="vertical" bordered={ true } dataSource={ drawerData } loading={ loading } renderItem={ visitedListRenderItem } />
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