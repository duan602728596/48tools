import { useMemo, useEffect, type ReactElement } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { createStructuredSelector, type Selector } from 'reselect';
import { Select } from 'antd';
import type { DefaultOptionType, SelectHandler } from 'rc-select/es/Select';
import { IDBCursorAccountList, type WeiboLoginInitialState } from '../../../../functionalComponents/WeiboLogin/reducers/weiboLogin';
import dbConfig from '../../../../utils/IDB/IDBConfig';
import type { WeiboAccount } from '../../../../commonTypes';

/* redux selector */
type RSelector = WeiboLoginInitialState;
type RState = { weiboLogin: WeiboLoginInitialState };

const selector: Selector<RState, RSelector> = createStructuredSelector({
  // 微博已登陆账号
  accountList: ({ weiboLogin }: RState): Array<WeiboAccount> => weiboLogin?.accountList
});

interface AccountSelectProps {
  value?: string;
  disabled?: boolean;
  onSelect?: SelectHandler<string>;
  onChange?(v: string): void;
}

/* 微博账号选择 */
function AccountSelect(props: AccountSelectProps): ReactElement {
  const { value, disabled, onSelect, onChange }: AccountSelectProps = props;
  const { accountList = [] }: RSelector = useSelector(selector);
  const dispatch: Dispatch = useDispatch();
  const options: Array<DefaultOptionType> = useMemo(function(): Array<DefaultOptionType> {
    return accountList.map((account: WeiboAccount): DefaultOptionType => ({
      label: account.username,
      value: account.id
    }));
  }, [accountList]);

  useEffect(function(): void {
    dispatch(IDBCursorAccountList({
      query: {
        indexName: dbConfig.objectStore[3].data[0]
      }
    }));
  }, []);

  return (
    <Select className="!w-[200px]"
      value={ value }
      options={ options }
      disabled={ disabled }
      onSelect={ onSelect }
      onChange={ onChange }
    />
  );
}

export default AccountSelect;