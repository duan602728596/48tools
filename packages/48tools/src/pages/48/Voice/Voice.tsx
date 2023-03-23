import { setTimeout, clearTimeout } from 'node:timers';
import { randomUUID } from 'node:crypto';
import {
  Fragment,
  useState,
  useMemo,
  useEffect,
  type ReactElement,
  type Dispatch as D,
  type SetStateAction as S,
  type MouseEvent
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { createStructuredSelector, type Selector } from 'reselect';
import { Button, message } from 'antd';
import type { UseMessageReturnType } from '@48tools-types/antd';
import type { DefaultOptionType } from 'rc-select/es/Select';
import Header from '../../../components/Header/Header';
import Pocket48Login from '../../../functionalComponents/Pocket48Login/Pocket48Login';
import FixSelect from '../components/FixSelect/FixSelect';
import { requestServerJump, requestServerSearch } from '../services/pocket48';
import {
  IDBCursorRoomVoiceInfo,
  IDBSaveRoomVoiceInfo,
  roomVoiceListSelectors,
  type RoomVoiceInitialState
} from '../reducers/roomVoice';
import dbConfig from '../../../utils/IDB/IDBConfig';
import type { ServerSearchResult, ServerApiItem, ServerJumpResult } from '../services/interface';
import type { RoomVoiceItem } from '../types';
import type { WebWorkerChildItem } from '../../../commonTypes';

let serverSearchTimer: NodeJS.Timeout | null = null; // 搜索

/* redux selector */
type RSelector = Pick<RoomVoiceInitialState, 'roomVoice'> & {
  roomVoiceWorkerList: Array<WebWorkerChildItem>;
};
type RState = { roomVoice: RoomVoiceInitialState };

const selector: Selector<RState, RSelector> = createStructuredSelector({
  // 正在下载
  roomVoiceWorkerList: ({ roomVoice }: RState): Array<WebWorkerChildItem> => roomVoiceListSelectors.selectAll(roomVoice),

  // 数据库保存的数据
  roomVoice: ({ roomVoice }: RState): Array<RoomVoiceItem> => roomVoice.roomVoice
});

/* 口袋房间电台 */
function Voice(props: {}): ReactElement {
  const { roomVoice, roomVoiceWorkerList }: RSelector = useSelector(selector);
  const dispatch: Dispatch = useDispatch();
  const [messageApi, messageContextHolder]: UseMessageReturnType = message.useMessage();
  const [searchLoading, setSearchLoading]: [boolean, D<S<boolean>>] = useState(false); // 搜索的loading状态
  const [searchResult, setSearchResult]: [Array<ServerApiItem>, D<S<ServerApiItem[]>>] = useState([]); // 搜索结果
  const [searchValue, setSearchValue]: [DefaultOptionType | undefined, D<S<DefaultOptionType | undefined>>]
    = useState(undefined);

  // 渲染searchServerResult
  const serverResultOptions: Array<DefaultOptionType> = useMemo(function(): Array<DefaultOptionType> {
    return searchResult.map((o: ServerApiItem): DefaultOptionType => ({
      label: o.serverDefaultName,
      value: `${ o.serverOwner }`
    }));
  }, [searchResult]);

  // 保存
  async function handleSaveClick(event: MouseEvent): Promise<void> {
    if (!searchValue) return;

    const item: RoomVoiceItem | undefined = roomVoice.find(
      (o: RoomVoiceItem): boolean => `${ o.serverId }` === searchValue.value);

    if (!item) return;

    const jumpRes: ServerJumpResult | undefined = await requestServerJump(Number(searchValue.value));

    if (jumpRes) {
      dispatch(IDBSaveRoomVoiceInfo({
        data: {
          id: randomUUID(),
          channelId: jumpRes.content.channelId,
          serverId: jumpRes.content.serverId,
          nickname: searchValue.label
        }
      }));
      messageApi.success('保存成功！');
    }
  }

  // 选择一个房间
  function handleOwnerSelect(value: string, option: DefaultOptionType): void {
    setSearchValue({
      label: option.label,
      value: option.value
    });
  }

  // 搜索
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

      if (res?.content?.serverApiList?.length) {
        setSearchResult(res.content.serverApiList);
      }

      setSearchLoading(false);
    });
  }

  useEffect(function(): void {
    dispatch(IDBCursorRoomVoiceInfo({
      query: { indexName: dbConfig.objectStore[5].data[0] }
    }));
  }, []);

  return (
    <Fragment>
      <Header>
        <FixSelect value={ searchValue }
          loading={ searchLoading }
          options={ serverResultOptions }
          placeholder="输入成员名字搜索"
          onSearch={ handleServerSearch }
          onSelect={ handleOwnerSelect }
        />
        <Button className="mx-[8px]" onClick={ handleSaveClick }>保存</Button>
        <Pocket48Login />
      </Header>
      { messageContextHolder }
    </Fragment>
  );
}

export default Voice;