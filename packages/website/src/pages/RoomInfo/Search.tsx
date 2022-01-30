import {
  Fragment,
  useState,
  useMemo,
  type ReactElement,
  type Dispatch as D,
  type SetStateAction as S,
  type MouseEvent
} from 'react';
import { Form, Input, Button, DotLoading, List, Empty } from 'antd-mobile';
import type { FormInstance } from 'antd-mobile/es/components/form';
import { ExclamationShieldFill as IconExclamationShieldFill } from 'antd-mobile-icons';
import classNames from 'classnames';
import mainStyle from '../../components/Main/main.module.sass';
import { useReqRoomIdListQuery } from './reducers/roomInfo.query';
import type { QuerySubState } from '../../store/queryTypes';
import type { RoomId } from '../../../src-api/services/interface';

interface FormQuery {
  query: string | undefined;
}

/* 搜索信息 */
function Search(props: {}): ReactElement {
  const [form]: [FormInstance] = Form.useForm();
  const { data: roomIdList = [], isLoading }: QuerySubState<Array<RoomId>> = useReqRoomIdListQuery();
  const [query, setQuery]: [FormQuery, D<S<FormQuery>>] = useState({ query: undefined }); // 查询条件

  // 渲染数据
  const listElement: Array<ReactElement> = useMemo(function(): Array<ReactElement> {
    const element: Array<ReactElement> = [];
    let func: ((item: RoomId) => boolean) | undefined;

    if (typeof query.query === 'string') {
      if (/^[0-9]+$/.test(query.query)) {
        func = (item: RoomId): boolean => item.id === Number(query.query!);
      } else if (!/^\s*$/.test(query.query)) {
        func = (item: RoomId): boolean => item.ownerName.includes(query.query!);
      }
    }

    for (const item of roomIdList) {
      if (func === undefined || func(item)) {
        element.push(
          <List.Item key={ `${ item.id }` } description={ item.account }>
            <div className="grid grid-cols-3 gap-3">
              <div className="mr-[8px]">{ item.ownerName }</div>
              <div className="mr-[8px]">ID：{ item.id }</div>
              <div>房间ID：{ item.roomId }</div>
            </div>
          </List.Item>
        );
      }
    }

    return element;
  }, [roomIdList, query]);

  // 搜索
  function handleSearchClick(event: MouseEvent<HTMLButtonElement>): void {
    const formValue: FormQuery = form.getFieldsValue();

    setQuery(formValue);
  }

  return (
    <Fragment>
      <Form className="shrink-0" form={ form }>
        <Form.Item name="query">
          <Input placeholder="请输入要搜索的姓名或者ID" />
        </Form.Item>
        <div className="mx-[20px] mb-[20px]">
          <Button color="primary" block={ true } onClick={ handleSearchClick }>搜索</Button>
        </div>
      </Form>
      <div className={ classNames('grow overflow-auto py-[16px]', mainStyle.touchOverflow) }>
        {
          isLoading ? (
            <div className="text-center">
              <DotLoading color="primary" />
              数据加载中
            </div>
          ) : (listElement.length > 0 ? <List>{ listElement }</List> : (
            <Empty image={ <IconExclamationShieldFill className="text-[48px]" /> }
              description="暂无数据"
            />
          ))
        }
      </div>
    </Fragment>
  );
}

export default Search;