import {
  Fragment,
  useState,
  type ReactElement,
  type Dispatch as D,
  type SetStateAction as S,
  type MouseEvent
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { createStructuredSelector, type Selector } from 'reselect';
import { Form, Input, Button, DotLoading, Toast, List, Checkbox } from 'antd-mobile';
import type { FormInstance } from 'antd-mobile/es/components/form';
import * as dayjs from 'dayjs';
import { useReqRoomIdListQuery } from '../RoomInfo/reducers/roomInfo.query';
import { setRoomId, setLiveList, type RecordInitialState } from './reducers/record';
import GraphQLRequest, { isGraphQLData, type GraphQLResponse } from '../../utils/GraphQLRequest';
import type { QuerySubState } from '../../store/queryTypes';
import type { RoomId, LiveInfo } from '../../../api/services/interface';

interface RecordResponseData {
  record: {
    next: string;
    liveList: Array<LiveInfo>;
  };
}

/* redux selector */
type RState = { record: RecordInitialState };

const selector: Selector<RState, RecordInitialState> = createStructuredSelector({
  // 搜索的next
  next: ({ record }: RState): string | undefined => record.next,

  // 搜索结果
  liveList: ({ record }: RState): Array<LiveInfo> => record.liveList,

  // 录播下载
  roomId: ({ record }: RState): RoomId | undefined => record.roomId
});

/* 视频下载 */
function Download(props: {}): ReactElement {
  const { next, liveList, roomId }: RecordInitialState = useSelector(selector);
  const dispatch: Dispatch = useDispatch();
  const [form]: [FormInstance] = Form.useForm();
  const { data: roomIdList = [] }: QuerySubState<Array<RoomId>> = useReqRoomIdListQuery();
  const [loading, setLoading]: [boolean, D<S<boolean>>] = useState(false);

  // 加载数据
  async function getData(loadNext: string, loadUserId: number, list: Array<LiveInfo>): Promise<void> {
    setLoading(true);

    try {
      const res: GraphQLResponse<RecordResponseData> = await GraphQLRequest<RecordResponseData>(/* GraphQL */ `
        {
            record(userId: ${ loadUserId }, next: "${ loadNext }") {
                next
                    liveList {
                    title
                    liveId
                    ctime
                    userInfo {
                        nickname
                    }
                }
            }
        }
      `);

      if (isGraphQLData<RecordResponseData>(res)) {
        dispatch(setLiveList({
          next: res.data.record.next,
          liveList: list.concat(res.data.record.liveList)
        }));
      } else {
        Toast.show({
          icon: 'fail',
          position: 'top',
          content: '数据加载失败'
        });
      }
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  }

  // 加载更多
  function handleLoadMoreDataClick(event: MouseEvent<HTMLButtonElement>): void {
    getData(next!, roomId?.id!, liveList);
  }

  // 搜索
  function handleSearchClick(event: MouseEvent<HTMLButtonElement>): void {
    const formValue: { query: string | undefined } = form.getFieldsValue();

    if (formValue.query && /^[0-9]+$/.test(formValue.query)) {
      let findItem: RoomId | undefined = undefined;

      findItem = roomIdList.find((o: RoomId): boolean => o.id === Number(formValue.query));

      // 找到对应的id并搜索
      if (findItem) {
        if (findItem.id !== roomId?.id) {
          dispatch(setRoomId(findItem));
          getData('0', findItem.id, []);
        }
      } else {
        Toast.show({
          icon: 'fail',
          position: 'top',
          content: 'ID不存在'
        });
      }
    }
  }

  // 渲染List
  function listRender(): Array<ReactElement> {
    return liveList.map((item: LiveInfo): ReactElement => {
      const time: string = dayjs(Number(item.ctime)).format('YYYY-MM-DD HH:mm:ss');

      return (
        <List.Item key={ item.liveId } description={ item.userInfo.nickname }>
          <div className="flex">
            <div className="grow">
              <Checkbox>{ item.title }</Checkbox>
            </div>
            <time>{ time }</time>
          </div>
        </List.Item>
      );
    });
  }

  return (
    <Fragment>
      <Form form={ form }>
        <Form.Item className="h-[75px]" name="query" rules={ [{ required: true, message: '必须输入ID' }] }>
          <Input placeholder="请输入要下载录播的小偶像的ID" />
        </Form.Item>
        <div className="mx-[20px] mb-[20px]">
          <Button color="primary" block={ true } onClick={ handleSearchClick }>搜索</Button>
        </div>
      </Form>
      <div className="mb-[32px]">
        { liveList.length > 0 && <List>{ listRender() }</List> }
        <div className="h-[40px] bg-white">
          {
            loading ? (
              <div className="leading-[40px] text-center">
                <DotLoading color="primary" />
                数据加载中
              </div>
            ) : (liveList.length > 0 && (
              <Button className="h-[40px]"
                color="warning"
                block={ true }
                onClick={ handleLoadMoreDataClick }
              >
                加载更多
              </Button>
            ))
          }
        </div>
      </div>
    </Fragment>
  );
}

export default Download;