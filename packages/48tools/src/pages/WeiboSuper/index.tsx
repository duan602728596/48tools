import { useState, useEffect, ReactElement, ReactNodeArray, Dispatch as D, SetStateAction as S } from 'react';
import type { Dispatch } from 'redux';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector, createStructuredSelector, Selector } from 'reselect';
import { Select, Button, Space, List } from 'antd';
import style from './index.sass';
import Content from '../../components/Content/Content';
import Header from '../../components/Header/Header';
import WeiboLogin from '../../components/WeiboLogin/WeiboLogin';
import { idbCursorAccountList } from '../../components/WeiboLogin/reducers/weiboLogin';
import dbConfig from '../../utils/idb/dbConfig';
import type { WeiboSuperInitialState } from './reducers/weiboSuper';
import type { WeiboLoginInitialState } from '../../components/WeiboLogin/reducers/weiboLogin';
import type { WeiboAccount } from '../../types';
import type { WeiboCheckinResult } from './types';

/* redux selector */
type RSelector = WeiboLoginInitialState & WeiboSuperInitialState;

const selector: Selector<any, RSelector> = createStructuredSelector({
  // 微博已登陆账号
  accountList: createSelector(
    ({ weiboLogin }: { weiboLogin: WeiboLoginInitialState }): Array<WeiboAccount> => weiboLogin.accountList,
    (data: Array<WeiboAccount>): Array<WeiboAccount> => data
  ),
  // 登陆列表
  weiboCheckinList: createSelector(
    ({ weiboSuper }: { weiboSuper: WeiboSuperInitialState }): Array<WeiboCheckinResult> => weiboSuper.weiboCheckinList,
    (data: Array<WeiboCheckinResult>): Array<WeiboCheckinResult> => data
  ),
  // 签到状态
  checkIn: createSelector(
    ({ weiboSuper }: { weiboSuper: WeiboSuperInitialState }): boolean => weiboSuper.checkIn,
    (data: boolean): boolean => data
  )
});

/* 微博超话签到 */
function Index(props: {}): ReactElement {
  const { accountList, weiboCheckinList, checkIn }: RSelector = useSelector(selector);
  const dispatch: Dispatch = useDispatch();
  const [accountValue, setAccountValue]: [string | undefined, D<S<string | undefined>>] = useState(undefined);

  // 渲染select
  function accountSelectRender(): ReactNodeArray {
    return accountList.map((item: WeiboAccount, index: number): ReactElement => {
      return <Select.Option key={ item.id } value={ item.id }>{ item.username }</Select.Option>;
    });
  }

  useEffect(function(): void {
    dispatch(idbCursorAccountList({
      query: {
        indexName: dbConfig.objectStore[3].data[0]
      }
    }));
  }, []);

  return (
    <Content>
      <Header>
        <Space>
          <Select className={ style.accountSelect }
            value={ accountValue }
            disabled={ checkIn }
            onSelect={ (value: string): void => setAccountValue(value) }
          >
            { accountSelectRender() }
          </Select>
          {
            checkIn
              ? <Button type="primary" danger={ true }>停止签到</Button>
              : <Button type="primary" disabled={ accountValue === undefined }>超话签到</Button>
          }
          <WeiboLogin />
        </Space>
      </Header>
    </Content>
  );
}

export default Index;