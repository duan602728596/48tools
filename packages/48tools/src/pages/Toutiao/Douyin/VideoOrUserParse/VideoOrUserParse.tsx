import { randomUUID } from 'node:crypto';
import {
  Fragment,
  useState,
  type ReactElement,
  type ReactNode,
  type Dispatch as D,
  type SetStateAction as S,
  type ChangeEvent,
  type MouseEvent
} from 'react';
import { useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { Input, message, Modal, Select, Table, Button } from 'antd';
import type { BaseOptionType } from 'rc-select/es/Select';
import type { ColumnsType } from 'antd/es/table';
import { Onion } from '@bbkkbkk/q';
import type { UseMessageReturnType } from '@48tools-types/antd';
import {
  requestAwemePostV2,
  requestDouyinUser,
  requestTtwidCookie,
  type AwemePostResponse,
  type AwemeItem,
  type DouyinHtmlResponseType
} from '@48tools-api/toutiao/douyin';
import style from './videoOrUserParse.sass';
import douyinStyle from '../douyin.sass';
import parseValueMiddleware from '../function/middlewares/parseValueMiddleware';
import verifyMiddleware, { verifyCookie } from '../function/middlewares/verifyMiddleware';
import rendedDataMiddleware from '../function/middlewares/rendedDataMiddleware';
import { setAddDownloadList, setAddDownloadListAll } from '../../reducers/douyinDownload';
import { douyinCookie } from '../../../../utils/toutiao/DouyinCookieStore';
import * as toutiaosdk from '../../sdk/toutiaosdk';
import type { DownloadUrlItem, DownloadItem, UserDataItem, VideoQuery } from '../../types';

/* select渲染 */
function selectOptionsRender(downloadUrl: Array<DownloadUrlItem>): Array<ReactElement> {
  return downloadUrl.map((item: DownloadUrlItem, index: number): ReactElement => {
    return <Select.Option key={ item.label + item.value } value={ item.value } item={ item }>{ item.label }</Select.Option>;
  });
}

function isUserDataItem(x: UserDataItem | AwemeItem): x is UserDataItem {
  return 'playApi' in x.video;
}

/* userData select渲染 */
function userDataSelectOptionsRender(record: UserDataItem | AwemeItem): Array<ReactElement> {
  const element: Array<ReactElement> = [];
  let i: number = 1;

  if (isUserDataItem(record)) {
    const noWatchMarkValue: string = `https:${ record.video.playApi }`;

    element.push(
      <Select.Option key={ `${ record.awemeId }无水印@${ noWatchMarkValue }@a` }
        value={ noWatchMarkValue }
        item={{ label: '无水印', value: noWatchMarkValue }}
        alert={ true }
      >
        无水印
      </Select.Option>
    );

    for (const bitRate of record.video.bitRateList) {
      for (const addr of bitRate.playAddr) {
        const labelText: string = `下载地址-${ i++ }(${ bitRate.width }*${ bitRate.height })`;
        const value: string = `https:${ addr.src }`;

        element.push(
          <Select.Option key={ `${ record.awemeId }@${ labelText }@${ value }@b` } value={ value } item={{
            label: labelText,
            value,
            width: bitRate.width,
            height: bitRate.height
          }}>
            { labelText }
          </Select.Option>
        );
        i += 1;
      }
    }
  } else {
    for (const bitRate of (record.video.bit_rate ?? [])) {
      for (const videoUrl of bitRate.play_addr.url_list) {
        const labelText: string = `下载地址-${ i++ }(${ bitRate.play_addr.width }*${ bitRate.play_addr.height })`;

        element.push(
          <Select.Option key={ `${ record.aweme_id }@${ labelText }@${ videoUrl }@c` } value={ videoUrl } item={{
            label: labelText,
            value: videoUrl,
            width: bitRate.play_addr.width,
            height: bitRate.play_addr.height
          }}>
            { labelText }
          </Select.Option>
        );
      }
    }

    for (const image of (record.images ?? [])) {
      for (const addr of image.url_list) {
        const labelText: string = `图片-下载地址${ i++ }(${ image.width }*${ image.height })`;

        element.push(
          <Select.Option key={ `${ record.aweme_id }@${ labelText }@${ addr }@d` } value={ addr } item={{
            label: labelText,
            value: addr,
            width: image.width,
            height: image.height,
            isImage: true
          }}>
            { labelText }
          </Select.Option>
        );
      }
    }
  }

  return element;
}

/* 视频或用户解析 */
function VideoOrUserParse(props: {}): ReactElement {
  const dispatch: Dispatch = useDispatch();
  const [messageApi, messageContextHolder]: UseMessageReturnType = message.useMessage();
  const [urlLoading, setUrlLoading]: [boolean, D<S<boolean>>] = useState(false);

  // 单个视频下载
  const [visible, setVisible]: [boolean, D<S<boolean>>] = useState(false); // 弹出层的显示隐藏
  const [downloadUrl, setDownloadUrl]: [DownloadUrlItem[], D<S<DownloadUrlItem[]>>] = useState([]); // 视频下载地址
  const [selectedUrl, setSelectedUrl]: [DownloadUrlItem | undefined, D<S<DownloadUrlItem | undefined>>]
    = useState(undefined); // 选中的下载地址
  const [title, setTitle]: [string, D<S<string>>] = useState(''); // 视频标题

  // 用户视频列表
  const [userModalVisible, setUserModalVisible]: [boolean, D<S<boolean>>] = useState(false); // 多个视频下载的弹出层的显示隐藏
  const [userVideoList, setUserVideoList]: [Array<UserDataItem | AwemeItem>, D<S<(UserDataItem | AwemeItem)[]>>]
    = useState([]); // 用户视频列表
  const [videoQuery, setVideoQuery]: [VideoQuery | undefined, D<S<VideoQuery | undefined>>]
    = useState(undefined); // 加载下一页时用
  const [userTitle, setUserTitle]: [string, D<S<string>>] = useState('');
  const [userVideoLoadDataLoading, setUserVideoLoadDataLoading]: [boolean, D<S<boolean>>] = useState(false);

  // 点击加载下一页
  async function handleLoadUserVideoDataClick(event: MouseEvent): Promise<void> {
    if (!videoQuery) return;

    if (videoQuery?.hasMore === 0) {
      messageApi.warning('暂时没有更多了'!);

      return;
    }

    setUserVideoLoadDataLoading(true);

    // 请求数据并变更状态
    const response: Function = async (cookie: string): Promise<boolean> => {
      const res: AwemePostResponse | string = await requestAwemePostV2(cookie, videoQuery);

      if (typeof res === 'object') {
        const awemeList: Array<AwemeItem> = (res?.aweme_list ?? []).filter((o: AwemeItem): boolean => ('video' in o));

        setVideoQuery((prevState: VideoQuery): VideoQuery => ({
          ...prevState,
          maxCursor: res.max_cursor,
          hasMore: res.has_more ?? 0
        }));
        setUserVideoList((prevState: Array<UserDataItem | AwemeItem>): Array<UserDataItem | AwemeItem> =>
          prevState.concat(awemeList));

        return true;
      } else {
        return false;
      }
    };

    try {

      if (!await response(douyinCookie.toString())) {
        const sxrId: string = 'MS4wLjABAAAAGSCToXHJLbkSaouYNJU68raa3TYVliiEW0tWp2dpNio';
        const sxrDouyinUser: DouyinHtmlResponseType = await requestDouyinUser((u: string) => `${ u }${ sxrId }`);

        if (sxrDouyinUser.type === 'cookie') {
          // 计算__ac_signature并获取html
          const acSignature: string = await toutiaosdk.acrawler('sign', ['', sxrDouyinUser.cookie]);

          await requestTtwidCookie();
          douyinCookie.setKV('__ac_nonce', sxrDouyinUser.cookie);
          douyinCookie.setKV('__ac_signature', acSignature);

          const douyinVideo: DouyinHtmlResponseType = await requestDouyinUser((u: string) => `${ u }${ sxrId }`, douyinCookie.toString());

          if (douyinVideo.type === 'html' && douyinVideo.html && douyinVideo.html.includes('验证码中间页')) {
            const verifyCookieValue: string | undefined = await verifyCookie(douyinVideo.html, douyinCookie.toString());

            verifyCookieValue && douyinCookie.set(verifyCookieValue);
            await response(douyinCookie.toString());
          }
        }
      }
    } catch (err) {
      console.error(err);
      messageApi.error('数据加载失败！');
    }

    setUserVideoLoadDataLoading(false);
  }

  // 添加所有的下载地址
  function handleAddAllClick(event: MouseEvent): void {
    const downloadPayload: Array<DownloadItem> = [];

    for (const url of downloadUrl) {
      if (url.isFirstImage) {
        downloadPayload.push({
          qid: randomUUID(),
          url: url.value,
          title,
          width: url.width,
          height: url.height,
          isImage: true
        });
      }
    }

    dispatch(setAddDownloadListAll(downloadPayload));
    setVisible(false);
  }

  // 添加新的下载地址
  function handleAddClick(event: MouseEvent): void {
    if (selectedUrl) {
      dispatch(setAddDownloadList({
        qid: randomUUID(),
        url: selectedUrl.value,
        title,
        width: selectedUrl.width,
        height: selectedUrl.height,
        isImage: selectedUrl.isImage
      }));
    }

    setVisible(false);
  }

  // 全部下载
  function handleUserListDownloadImageAllClick(record: UserDataItem | AwemeItem, event: MouseEvent): void {
    if (('images' in record) && record?.images?.length) {
      const downloadPayload: Array<DownloadItem> = [];

      for (const image of record.images) {
        for (const url of image.url_list) {
          downloadPayload.push({
            qid: randomUUID(),
            url,
            title: record.desc,
            width: image.width,
            height: image.height,
            isImage: true
          });
        }
      }

      dispatch(setAddDownloadListAll(downloadPayload));
      messageApi.info('添加到下载列表。');
    }
  }

  // 选择下载地址
  function handleUserListDownloadUrlSelect(
    record: UserDataItem | AwemeItem,
    value: string,
    option: { item: DownloadUrlItem } & BaseOptionType
  ): void {
    dispatch(setAddDownloadList({
      qid: randomUUID(),
      url: option.item.value,
      title: record.desc,
      width: option.item.width,
      height: option.item.height,
      isImage: option.item.isImage
    }));
    messageApi.info('添加到下载列表。');
  }

  // 选择下载地址
  function handleDownloadUrlSelect(value: string, option: { item: DownloadUrlItem } & BaseOptionType): void {
    setSelectedUrl(option.item);
  }

  // 关闭后清除状态
  function videoDownloadModalAfterClose(): void {
    setDownloadUrl([]);
    setSelectedUrl(undefined);
    setTitle('');
  }

  function userModalAfterClose(): void {
    setUserVideoList([]);
    setVideoQuery(undefined);
    setUserTitle('');
  }

  // 解析视频地址
  function handleParseVideoOrUserSearch(value: string, event: ChangeEvent<HTMLInputElement>): void {
    if (/^\s*$/.test(value)) return;

    const onion: Onion = new Onion();

    onion.use(parseValueMiddleware);
    onion.use(verifyMiddleware);
    onion.use(rendedDataMiddleware);

    setUrlLoading(true);
    onion.run({
      value,
      messageApi,
      setUrlLoading,
      setVisible,
      setDownloadUrl,
      setTitle,
      setUserModalVisible,
      setUserVideoList,
      setVideoQuery,
      setUserTitle
    });
  }

  const columns: ColumnsType<UserDataItem | AwemeItem> = [
    {
      title: '视频标题',
      dataIndex: 'desc',
      render: (value: string, record: UserDataItem | AwemeItem, index: number): ReactElement =>
        <span className={ ('images' in record) && record?.images?.length ? douyinStyle.isImageMark : undefined }>{ value }</span>
    },
    {
      title: '操作',
      key: 'action',
      width: 330,
      render: (value: undefined, record: UserDataItem | AwemeItem, index: number): ReactNode => (
        <Fragment>
          <Select className={ style.userListUrlSelect }
            size="small"
            onSelect={ (v: string, option: { item: DownloadUrlItem } & BaseOptionType): void =>
              handleUserListDownloadUrlSelect(record, v, option) }
          >
            { userDataSelectOptionsRender(record) }
          </Select>
          {
            ('images' in record) && record?.images?.length ? (
              <Button className="ml-[4px]"
                size="small"
                onClick={ (event: MouseEvent): void => handleUserListDownloadImageAllClick(record, event) }
              >
                全部下载
              </Button>
            ) : null
          }
        </Fragment>
      )
    }
  ];

  return (
    <Fragment>
      <Input.Search className={ style.input }
        enterButton="解析视频"
        placeholder="输入视频ID、用户ID或用户主页地址"
        loading={ urlLoading }
        onSearch={ handleParseVideoOrUserSearch }
      />
      {/* 下载地址 */}
      <Modal title="选择下载地址"
        open={ visible }
        width={ 400 }
        centered={ true }
        destroyOnClose={ true }
        closable={ false }
        maskClosable={ false }
        afterClose={ videoDownloadModalAfterClose }
        footer={
          <Fragment>
            <Button onClick={ (event: MouseEvent): void => setVisible(false) }>取消</Button>
            {
              downloadUrl.length && downloadUrl.find((o: DownloadUrlItem): boolean => !!o.isImage) && (
                <Button key="downloadAll" onClick={ handleAddAllClick }>下载全部</Button>
              )
            }
            <Button type="primary" onClick={ handleAddClick }>确定</Button>
          </Fragment>
        }
        onCancel={ (event: MouseEvent): void => setVisible(false) }
      >
        <Select className={ style.urlSelect }
          value={ selectedUrl }
          onSelect={ handleDownloadUrlSelect }
        >
          { selectOptionsRender(downloadUrl) }
        </Select>
      </Modal>
      {/* 用户视频列表 */}
      <Modal title={ userTitle }
        open={ userModalVisible }
        width={ 800 }
        centered={ true }
        destroyOnClose={ true }
        closable={ false }
        maskClosable={ false }
        afterClose={ userModalAfterClose }
        confirmLoading={ userVideoLoadDataLoading }
        okText="加载下一页视频"
        okButtonProps={{ disabled: videoQuery?.['hasMore'] === 0 }}
        cancelText="关闭"
        onOk={ handleLoadUserVideoDataClick }
        onCancel={ (event: MouseEvent): void => setUserModalVisible(false) }
      >
        <div className="h-[410px] overflow-auto">
          <Table size="small"
            dataSource={ userVideoList }
            columns={ columns }
            rowKey={ (o: UserDataItem | AwemeItem): string => ('awemeId' in o) ? o.awemeId : o.aweme_id }
            pagination={{
              pageSize: 10,
              showQuickJumper: true,
              showSizeChanger: false
            }}
            scroll={{ y: 310 }}
          />
        </div>
      </Modal>
      { messageContextHolder }
    </Fragment>
  );
}

export default VideoOrUserParse;