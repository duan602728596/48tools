import { setTimeout, clearTimeout } from 'node:timers';
import {
  Fragment,
  useState,
  useMemo,
  type ReactElement,
  type Dispatch as D,
  type SetStateAction as S,
  type MouseEvent
} from 'react';
import { Button, message, Pagination } from 'antd';
import type { DefaultOptionType } from 'rc-select/es/select';
import type { LabeledValue, UseMessageReturnType } from '@48tools-types/antd';
import { useSelector, useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { createStructuredSelector, Selector } from 'reselect';
import style from './searchMessage.sass';
import FixSelect from './FixSelect';
import Header from '../../../../components/Header/Header';
import Pocket48Login from '../../../../functionalComponents/Pocket48Login/Pocket48Login';
import {
  setSearchSelectValue,
  setSearchServerResult,
  setQueryRecord,
  setHomeMessage,
  type RoomMessageInitialState
} from '../../reducers/roomMessage';
import { requestServerSearch, requestServerJump, requestHomeownerMessage } from '../../services/pocket48';
import { formatDataArray } from '../formatData';
import MessageDisplay from '../MessageDisplay/MessageDisplay';
import type {
  ServerSearchResult,
  ServerApiItem,
  ServerJumpResult,
  HomeMessageResult,
  CustomMessageV2
} from '../../services/interface';
import type { QueryRecord, FormatCustomMessage } from '../../types';

/* 分页 */
interface Page {
  current: number;
  pageSize: number;
}

/* 搜索 */
let serverSearchTimer: NodeJS.Timeout | null = null;

/* redux selector */
type RState = { roomMessage: RoomMessageInitialState };

const selector: Selector<RState, RoomMessageInitialState> = createStructuredSelector({
  // 搜索的值
  searchSelectValue: ({ roomMessage }: RState): LabeledValue | undefined => roomMessage.searchSelectValue,

  // 搜索的结果
  searchServerResult: ({ roomMessage }: RState): Array<ServerApiItem> => roomMessage.searchServerResult,

  // 查询条件
  query: ({ roomMessage }: RState): QueryRecord | {} => roomMessage.query,

  // 查询结果
  homeMessage: ({ roomMessage }: RState): Array<FormatCustomMessage> => roomMessage.homeMessage,

  // 原始数据
  homeMessageRaw: ({ roomMessage }: RState): Array<CustomMessageV2> => roomMessage.homeMessageRaw
});

/* 搜索和导出房间消息 */
function SearchMessage(props: {}): ReactElement {
  const {
    searchSelectValue,
    searchServerResult,
    query,
    homeMessage,
    homeMessageRaw
  }: RoomMessageInitialState = useSelector(selector);
  const dispatch: Dispatch = useDispatch();
  const [messageApi, messageContextHolder]: UseMessageReturnType = message.useMessage();
  const [searchLoading, setSearchLoading]: [boolean, D<S<boolean>>] = useState(false); // 搜索的loading状态
  const [homeMessageLoading, setHomeMessageLoading]: [boolean, D<S<boolean>>] = useState(false); // 加载数据的loading状态
  const [homeMessagePage, setHomeMessagePagePage]: [Page, D<S<Page>>] = useState({
    current: 0,
    pageSize: 200
  });

  // 渲染searchServerResult
  const serverResultOptions: Array<DefaultOptionType> = useMemo(function(): Array<DefaultOptionType> {
    return searchServerResult.map((o: ServerApiItem): DefaultOptionType => ({
      label: o.serverDefaultName,
      value: `${ o.serverOwner }`
    }));
  }, [searchServerResult]);

  // homeMessage分页
  const homeMessageSlice: Array<FormatCustomMessage> = useMemo(function(): Array<FormatCustomMessage> {
    const index: number = homeMessagePage.pageSize * homeMessagePage.current;

    return homeMessage.slice(index, index + homeMessagePage.pageSize);
  }, [homeMessagePage.current, homeMessagePage.pageSize, homeMessage]);

  // 分页变化
  function handlePageChange(page: number, pageSize: number): void {
    setHomeMessagePagePage((prevState: Page): Page => ({ ...prevState, current: page - 1 }));
  }

  // 获取数据
  async function handleGetHomeownerMessageClick(event: MouseEvent): Promise<void> {
    if (searchSelectValue === undefined) {
      messageApi.warning('请先选择要查询的成员！');

      return;
    }

    setHomeMessageLoading(true);

    try {
      let queryRecord: QueryRecord | {} = query;

      if (!('ownerId' in query) || query.ownerId !== Number(searchSelectValue.value)) {
        const jumpRes: ServerJumpResult | undefined = await requestServerJump(Number(searchSelectValue.value));

        if (jumpRes?.content?.channelId && jumpRes?.content?.serverId) {
          queryRecord = {
            ownerId: Number(searchSelectValue.value),
            channelId: jumpRes.content.channelId,
            serverId: jumpRes.content.serverId,
            nextTime: 0
          };
          dispatch(setQueryRecord(queryRecord));
        }
      }

      const homeownerMessageRes: HomeMessageResult | undefined = await requestHomeownerMessage(
        (queryRecord as QueryRecord).channelId,
        (queryRecord as QueryRecord).serverId,
        (queryRecord as QueryRecord).nextTime);

      if (homeownerMessageRes?.content?.message?.length) {
        if ((queryRecord as QueryRecord).nextTime === 0) {
          dispatch(setHomeMessage({
            formatData: formatDataArray(homeownerMessageRes.content.message),
            rawData: homeownerMessageRes.content.message
          }));
          setHomeMessagePagePage((prevState: Page): Page => ({ ...prevState, current: 0 }));
        } else {
          dispatch(setHomeMessage({
            formatData: homeMessage.concat(formatDataArray(homeownerMessageRes.content.message)),
            rawData: homeMessageRaw.concat(homeownerMessageRes.content.message)
          }));
        }

        dispatch(setQueryRecord({
          ...queryRecord,
          nextTime: homeownerMessageRes.content.nextTime
        }));
      } else {
        messageApi.error('获取数据失败！');
      }
    } catch (err) {
      console.error(err);
      messageApi.error('获取数据失败！');
    }

    setHomeMessageLoading(false);
  }

  // 选择一个房间
  function handleOwnerSelect(value: string, option: DefaultOptionType): void {
    dispatch(setSearchSelectValue({
      label: option.label,
      value: option.value
    }));
  }

  // 搜索名字
  function handleServerSearch(value: string): void {
    if (serverSearchTimer !== null) {
      clearTimeout(serverSearchTimer);
      serverSearchTimer = null;
    }

    if (!(value && /[\u4E00-\u9FFF]+/.test(value))) {
      setSearchLoading(false);

      return;
    }

    setSearchLoading(true);
    serverSearchTimer = setTimeout(async (): Promise<void> => {
      const res: ServerSearchResult | undefined = await requestServerSearch(value);

      if (res?.content.serverApiList?.length) {
        dispatch(setSearchServerResult(res.content.serverApiList));
      }

      setSearchLoading(false);
    }, 1_000);
  }

  return (
    <Fragment>
      <Header>
        <label className={ style.label }>输入成员名字搜索：</label>
        <FixSelect className={ style.searchSelect }
          showSearch={ true }
          value={ searchSelectValue }
          loading={ searchLoading }
          options={ serverResultOptions }
          onSearch={ handleServerSearch }
          onSelect={ handleOwnerSelect }
        />
        <Button className="mx-[8px]"
          disabled={ searchSelectValue === undefined || homeMessageLoading }
          onClick={ handleGetHomeownerMessageClick }
        >
          加载数据
        </Button>
        <Pocket48Login />
      </Header>
      <div className="flex-grow overflow-hidden">
        <MessageDisplay data={ homeMessageSlice } loading={ homeMessageLoading } />
      </div>
      <div className="pt-[8px]">
        <Pagination pageSize={ homeMessagePage.pageSize }
          current={ homeMessagePage.current + 1 }
          showQuickJumper={ true }
          showSizeChanger={ false }
          total={ homeMessage.length }
          onChange={ handlePageChange }
        />
      </div>
      { messageContextHolder }
    </Fragment>
  );
}

export default SearchMessage;