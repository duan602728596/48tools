import { setTimeout, clearTimeout } from 'node:timers';
import * as fs from 'node:fs';
import { promises as fsP } from 'node:fs';
import * as path from 'node:path';
import type { ParsedPath } from 'node:path';
import type { SaveDialogReturnValue } from 'electron';
import {
  Fragment,
  useState,
  useMemo,
  type ReactElement,
  type Dispatch as D,
  type SetStateAction as S,
  type MouseEvent
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { createStructuredSelector, Selector } from 'reselect';
import { Button, message, Modal, Pagination, Space } from 'antd';
import type { DefaultOptionType } from 'rc-select/es/Select';
import type { LabeledValue, UseMessageReturnType } from '@48tools-types/antd';
import Icon, { Html5Filled as IconHtml5Filled, FileImageOutlined as IconFileImageOutlined } from '@ant-design/icons';
import * as dayjs from 'dayjs';
import {
  requestServerSearch,
  requestServerJump,
  requestHomeownerMessage,
  requestRoomInfo,
  type ServerSearchResult,
  type ServerApiItem,
  type ServerJumpResult,
  type HomeMessageResult,
  type CustomMessageV2,
  type RoomInfo, requestDownloadFileByStream
} from '@48tools-api/48';
import FixSelect from '../../components/FixSelect/FixSelect';
import Header from '../../../../components/Header/Header';
import Pocket48Login from '../../../../functionalComponents/Pocket48Login/Pocket48Login';
import {
  setSearchSelectValue,
  setSearchServerResult,
  setQueryRecord,
  setHomeMessage,
  type RoomMessageInitialState
} from '../../reducers/roomMessage';
import { formatDataArray, formatSendData } from '../utils/formatData';
import createHtml from '../utils/createHtml';
import MessageDisplay from '../MessageDisplay/MessageDisplay';
import LocalMessage from '../LocalMessage/LocalMessage';
import { showSaveDialog } from '../../../../utils/remote/dialog';
import { getFilePath } from '../../../../utils/utils';
import { source } from '../../../../utils/snh48';
import IconJSONSvgComponent from '../../images/JSON.component.svg';
import type { QueryRecord, FormatCustomMessage, SendDataItem } from '../../types';

const IconJSONFile: ReactElement = <Icon component={ IconJSONSvgComponent } />;

/* 分页 */
interface Page {
  current: number;
  pageSize: number;
}

export const PAGE_SIZE: number = 1_000; // 导出html的每页数据
let serverSearchTimer: NodeJS.Timeout | null = null; // 搜索

/* redux selector */
type RSelector = Omit<RoomMessageInitialState, 'localMessageBrowser'>;
type RState = { roomMessage: RoomMessageInitialState };

const selector: Selector<RState, RSelector> = createStructuredSelector({
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
  }: RSelector = useSelector(selector);
  const dispatch: Dispatch = useDispatch();
  const [messageApi, messageContextHolder]: UseMessageReturnType = message.useMessage();
  const [searchLoading, setSearchLoading]: [boolean, D<S<boolean>>] = useState(false); // 搜索的loading状态
  const [homeMessageLoading, setHomeMessageLoading]: [boolean, D<S<boolean>>] = useState(false); // 加载数据的loading状态
  const [homeMessagePage, setHomeMessagePage]: [Page, D<S<Page>>] = useState({
    current: 0,
    pageSize: 350
  });
  const [exportMessageModalOpen, setExportMessageModalOpen]: [boolean, D<S<boolean>>] = useState(false); // 导出消息

  // 点击导出html到文件夹中
  async function handleSavePDFDataClick(event: MouseEvent): Promise<void> {
    const result: SaveDialogReturnValue = await showSaveDialog({
      defaultPath: getFilePath({
        typeTitle: '口袋48房间消息(html)',
        infoArray: ['json', query['ownerName'], query['ownerId']]
      })
    });

    if (result.canceled || !result.filePath) return;

    messageApi.info('正在创建文件夹并保存数据。');

    // 创建目录
    if (!fs.existsSync(result.filePath)) {
      await fsP.mkdir(result.filePath);
    }

    const time: string = dayjs().format('YYYY-MM-DD HH:mm:ss');

    // 创建html文件
    for (let i: number = 0, j: number = homeMessageRaw.length, page: number = 1; i < j; i += PAGE_SIZE, page++) {
      const dataSlice: Array<SendDataItem> = formatSendData(homeMessageRaw.slice(i, i + PAGE_SIZE));

      await createHtml({
        data: dataSlice,
        filePath: result.filePath,
        page,
        length: j,
        time
      });
    }

    messageApi.success('成功保存数据！');
  }

  // 点击导出JSON数据到文件夹中
  async function handleSaveJSONDataClick(event: MouseEvent): Promise<void> {
    try {
      const result: SaveDialogReturnValue = await showSaveDialog({
        defaultPath: getFilePath({
          typeTitle: '口袋48房间消息(json)',
          infoArray: ['json', query['ownerName'], query['ownerId']]
        })
      });

      if (result.canceled || !result.filePath) return;

      messageApi.info('正在创建文件夹并保存数据。');

      // 创建目录
      if (!fs.existsSync(result.filePath)) {
        await fsP.mkdir(result.filePath);
      }

      // 写入json文件
      for (let i: number = 0, j: number = homeMessageRaw.length, page: number = 1; i < j; i += 3_000, page++) {
        const dataSlice: Array<SendDataItem> = formatSendData(homeMessageRaw.slice(i, i + 3_000));

        await fsP.writeFile(
          path.join(result.filePath, `${ page }.json`),
          JSON.stringify({ message: dataSlice }, null, 2),
          { encoding: 'utf8' });
      }

      messageApi.success('成功保存数据！');
    } catch (err) {
      console.error(err);
      messageApi.error('在保存数据的过程中出现错误！');
    }
  }

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
    setHomeMessagePage((prevState: Page): Page => ({ ...prevState, current: page - 1 }));
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

      // 如果没有query或者query的ownerId和select的不一致，需要重置query
      if (!('ownerId' in queryRecord) || queryRecord.ownerId !== Number(searchSelectValue.value)) {
        const jumpRes: ServerJumpResult | undefined = await requestServerJump(Number(searchSelectValue.value));

        if (jumpRes?.content?.channelId && jumpRes?.content?.serverId) {
          const qr: QueryRecord = queryRecord = {
            ownerName: searchSelectValue.label,
            ownerId: Number(searchSelectValue.value),
            channelId: jumpRes.content.channelId,
            serverId: jumpRes.content.serverId,
            nextTime: 0
          };

          dispatch(setQueryRecord(qr));
        }
      }

      if ('ownerId' in queryRecord) {
        // 请求房间消息
        const homeownerMessageRes: HomeMessageResult | undefined = await requestHomeownerMessage(
          queryRecord.channelId,
          queryRecord.serverId,
          queryRecord.nextTime);

        // 判断是否有数据
        if (homeownerMessageRes?.content?.message?.length) {
          if (queryRecord.nextTime === 0) {
            dispatch(setHomeMessage({
              formatData: formatDataArray(homeownerMessageRes.content.message),
              rawData: homeownerMessageRes.content.message
            }));
            setHomeMessagePage((prevState: Page): Page => ({ ...prevState, current: 0 }));
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
          messageApi.warning('没有获取到数据！');
        }
      }
    } catch (err) {
      console.error(err);
      messageApi.error('获取数据失败！');
    }

    setHomeMessageLoading(false);
  }

  // 下载房间背景图片
  async function handleDownloadRoomBackgroundImageClick(event: MouseEvent): Promise<void> {
    let channelId: string | number | undefined;

    if ('channelId' in query) {
      channelId = query.channelId;
    } else if (searchSelectValue?.value) {
      const jumpRes: ServerJumpResult | undefined = await requestServerJump(Number(searchSelectValue.value));

      jumpRes?.content?.channelId && (channelId = jumpRes.content.channelId);
    }

    if (!channelId) {
      messageApi.warning('请先选择一个成员的口袋房间。');

      return;
    }

    try {
      const res: RoomInfo | undefined = await requestRoomInfo(channelId);

      if (!(res?.content?.userChatConfig?.bgImg)) {
        messageApi.error('没有获取到口袋房间背景图片！请先登录。');

        return;
      }

      const bgUrl: string = res.content.userChatConfig.bgImg;
      const bgUrlParseResult: ParsedPath = path.parse(bgUrl);
      const result: SaveDialogReturnValue = await showSaveDialog({
        defaultPath: getFilePath({
          typeTitle: '口袋48房间背景图片下载',
          infoArray: [bgUrlParseResult.name],
          ext: bgUrlParseResult.ext
        })
      });

      if (result.canceled || !result.filePath) return;

      await requestDownloadFileByStream(source(bgUrl), result.filePath);
      messageApi.success('背景图片下载完成！');
    } catch (err) {
      console.error(err);
    }
  }

  // 选择一个房间
  function handleOwnerSelect(value: string, option: LabeledValue): void {
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

      if (res?.content?.serverApiList?.length) {
        dispatch(setSearchServerResult(res.content.serverApiList));
      }

      setSearchLoading(false);
    }, 1_000);
  }

  return (
    <Fragment>
      <Header>
        <FixSelect value={ searchSelectValue }
          loading={ searchLoading }
          options={ serverResultOptions }
          placeholder="输入成员名字搜索"
          onSearch={ handleServerSearch }
          onSelect={ handleOwnerSelect }
        />
        <Space.Compact className="mx-[8px]">
          <Button disabled={ searchSelectValue === undefined || homeMessageLoading }
            onClick={ handleGetHomeownerMessageClick }
          >
            加载数据
          </Button>
          <Button type="primary" onClick={ (event: MouseEvent): void => setExportMessageModalOpen(true) }>
            导出当前数据
          </Button>
        </Space.Compact>
        <Pocket48Login className="align-bottom" />
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
          showTotal={ (total: number): string => `共${ total }条数据` }
          onChange={ handlePageChange }
        />
      </div>
      <Modal title="导出当前数据"
        open={ exportMessageModalOpen }
        width={ 320 }
        closable={ false }
        centered={ true }
        destroyOnHidden={ true }
        footer={ <Button onClick={ (event: MouseEvent): void => setExportMessageModalOpen(false) }>关闭</Button> }
      >
        <Space className="w-full" direction="vertical" size={ 8 }>
          <div>
            <Button icon={ <IconHtml5Filled /> }
              block={ true }
              disabled={ homeMessageRaw.length === 0 }
              onClick={ handleSavePDFDataClick }
            >
              导出HTML格式的数据
            </Button>
          </div>
          <div>
            <Button className="mr-[8px]"
              icon={ IconJSONFile }
              block={ true }
              disabled={ homeMessageRaw.length === 0 }
              onClick={ handleSaveJSONDataClick }
            >
              导出JSON格式的数据
            </Button>
          </div>
          {
            globalThis.__INITIAL_STATE__.commandLineOptions['enable-48-room-message-local-message'] && (
              <div>
                <LocalMessage />
              </div>
            )
          }
          <div>
            <Button className="mr-[8px]"
              icon={ <IconFileImageOutlined /> }
              block={ true }
              onClick={ handleDownloadRoomBackgroundImageClick }
            >
              口袋房间背景图片下载
            </Button>
          </div>
        </Space>
      </Modal>
      { messageContextHolder }
    </Fragment>
  );
}

export default SearchMessage;