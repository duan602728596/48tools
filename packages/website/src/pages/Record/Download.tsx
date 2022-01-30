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
import { Form, Input, Button, DotLoading, Toast, List, Checkbox, Tag, NoticeBar } from 'antd-mobile';
import type { FormInstance } from 'antd-mobile/es/components/form';
import * as dayjs from 'dayjs';
import classNames from 'classnames';
import mainStyle from '../../components/Main/main.module.sass';
import { useReqRoomIdListQuery } from '../RoomInfo/reducers/roomInfo.query';
import {
  setRoomId,
  setLiveList,
  setLiveInfoItemCheckedChange,
  setLiveListCheckedClean,
  type RecordInitialState
} from './reducers/record';
import GraphQLRequest, { isGraphQLData, type GraphQLResponse } from '../../utils/GraphQLRequest';
import type { QuerySubState } from '../../store/queryTypes';
import type { RoomId, LiveInfo } from '../../../src-api/services/interface';
import type { RecordLiveInfo } from './types';

interface RecordResponseData {
  record: {
    next: string;
    liveList: Array<LiveInfo>;
  };
}

/* redux selector */
type RState = { record: RecordInitialState };

const selector: Selector<RState, RecordInitialState> = createStructuredSelector({
  next: ({ record }: RState): string | undefined => record.next,            // 搜索的next
  liveList: ({ record }: RState): Array<RecordLiveInfo> => record.liveList, // 搜索结果
  roomId: ({ record }: RState): RoomId | undefined => record.roomId         // 录播下载
});

/* 视频下载 */
function Download(props: {}): ReactElement {
  const { next, liveList, roomId }: RecordInitialState = useSelector(selector);
  const dispatch: Dispatch = useDispatch();
  const [form]: [FormInstance] = Form.useForm();
  const { data: roomIdList = [] }: QuerySubState<Array<RoomId>> = useReqRoomIdListQuery();
  const [loading, setLoading]: [boolean, D<S<boolean>>] = useState(false);

  // 加载数据
  async function getData(loadNext: string, loadUserId: number, list: Array<RecordLiveInfo>): Promise<void> {
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
                    liveType
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

        if (res.data.record.liveList.length === 0) {
          Toast.show({
            position: 'top',
            content: '没有数据'
          });
        }
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
    if (next && roomId) {
      getData(next, roomId.id, liveList);
    } else {
      Toast.show({
        position: 'top',
        content: '没有数据'
      });
    }
  }

  // 清空选中
  function handleClearCheckClick(event: MouseEvent<HTMLButtonElement>): void {
    dispatch(setLiveListCheckedClean(undefined));
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

  // checkbox选中
  function handleCheckboxChange(liveId: string, value: boolean): void {
    dispatch(setLiveInfoItemCheckedChange({ liveId, value }));
  }

  // 渲染List
  function listRender(): Array<ReactElement> {
    return liveList.map((item: RecordLiveInfo, index: number): ReactElement => {
      const time: string = dayjs(Number(item.ctime)).format('YYYY-MM-DD HH:mm:ss');

      return (
        <List.Item key={ item.liveId } description={ item.userInfo.nickname }>
          <div className="flex">
            <div className="grow">
              <Checkbox checked={ item.checked }
                onChange={ (value: boolean): void => handleCheckboxChange(item.liveId, value) }
              >
                { index + 1 }、
                <span className="ml-[6px]">{ item.title }</span>
              </Checkbox>
            </div>
            <div className="shrink-0 w-[70px]">
              {
                item.liveType === 2
                  ? <Tag className="ml-[16px]" color="warning">电台</Tag>
                  : <Tag className="ml-[16px]" color="purple">视频</Tag>
              }
            </div>
            <time className="shrink-0 w-[165px]">{ time }</time>
          </div>
        </List.Item>
      );
    });
  }

  return (
    <Fragment>
      <div className="shrink-0">
        <NoticeBar content="最多支持20个地址的导出。导出时间较慢，请耐心等待。" color="alert" />
      </div>
      <Form className="shrink-0" form={ form }>
        <Form.Item className="h-[75px]" name="query" rules={ [{ required: true, message: '必须输入ID' }] }>
          <Input placeholder="请输入要下载录播的小偶像的ID" />
        </Form.Item>
        <div className="mx-[20px] mb-[20px]">
          <Button color="primary" block={ true } onClick={ handleSearchClick }>搜索</Button>
        </div>
      </Form>
      <div className={ classNames('grow overflow-auto py-[16px]', mainStyle.touchOverflow) }>
        { liveList.length > 0 && <List>{ listRender() }</List> }
      </div>
      <div className="shrink-0 h-[50px] bg-blue-100">
        {
          loading ? (
            <div className="leading-[50px] text-center">
              <DotLoading color="primary" />
            </div>
          ) : (
            <div className="flex">
              <div className="w-1/4">
                <Button className="h-[50px] bg-blue-100" block={ true } onClick={ handleClearCheckClick }>
                  清空选中
                </Button>
              </div>
              <div className="w-2/4">
                <Button className="h-[50px] bg-blue-200" block={ true } onClick={ handleLoadMoreDataClick }>
                  加载更多
                </Button>
              </div>
              <div className="w-1/4">
                <Button className="h-[50px] bg-blue-100" block={ true }>
                  导出地址
                </Button>
              </div>
            </div>
          )
        }
      </div>
    </Fragment>
  );
}

export default Download;