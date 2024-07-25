import { randomUUID } from 'node:crypto';
import {
  Fragment,
  useState,
  useEffect,
  useTransition,
  type ReactElement,
  type ReactNode,
  type Dispatch as D,
  type SetStateAction as S,
  type MouseEvent,
  type TransitionStartFunction
} from 'react';
import { useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { Button, Modal, Input, Form, Table, Spin, message, type FormInstance } from 'antd';
import type { UseMessageReturnType } from '@48tools-types/antd';
import type { ColumnsType } from 'antd/es/table';
import * as classNames from 'classnames';
import { requestSpaceArcSearch, type SpaceArcSearchVListItem, type SpaceArcSearch } from '@48tools-api/bilibili/download';
import commonStyle from '../../../../common.sass';
import style from './addBySearch.sass';
import {
  parseVideoList,
  parseVideoUrlV2,
  type ParseVideoListArrayItemResult,
  type ParseVideoUrlV2ObjectResult
} from '../function/parseBilibiliUrl';
import { setAddDownloadList, setAddMoreDownloadLists } from '../../reducers/bilibiliDownload';
import type { DownloadItem as BilibiliDownloadItem } from '../../types';

interface PageQuery {
  id: string | undefined;
  current: number;
}

interface DownloadItem {
  cid: number;
  part: string;
  bvid: string;
  index: number;
}

/* 根据账号ID搜索 */
function AddBySearch(props: {}): ReactElement {
  const dispatch: Dispatch = useDispatch();
  const [messageApi, messageContextHolder]: UseMessageReturnType = message.useMessage();
  const [form]: [FormInstance] = Form.useForm();
  const [visible, setVisible]: [boolean, D<S<boolean>>] = useState(false);
  const [pageQuery, setPageQuery]: [PageQuery, D<S<PageQuery>>] = useState({
    current: 1,
    id: undefined
  });
  const [dataSource, setDataSource]: [SpaceArcSearchVListItem[], D<S<SpaceArcSearchVListItem[]>>] = useState([]); // 所有视频
  const [bvVideoList, setBvVideoList]: [DownloadItem[], D<S<DownloadItem[]>>] = useState([]); // 单个视频的part
  const [total, setTotal]: [number, D<S<number>>] = useState(0);                              // 视频总数
  const [downloadAllLoading, setDownloadAllLoading]: [boolean, D<S<boolean>>] = useState(false);
  const [getDataLoading, startGetDataTransition]: [boolean, TransitionStartFunction] = useTransition(); // 加载动画
  const [getUrlListLoading, startGetUrlListTransition]: [boolean, TransitionStartFunction] = useTransition(); // 单个视频搜索的part

  // 添加多个下载
  async function handleAddMoreDownloadQueuesClick(event: MouseEvent): Promise<void> {
    const addItems: Array<BilibiliDownloadItem> = [];

    setDownloadAllLoading(true);

    for (const item of bvVideoList) {
      try {
        const bvId: string = item.bvid.replace(/^bv/i, '');
        const result: ParseVideoUrlV2ObjectResult | void = await parseVideoUrlV2('bv', bvId, item.index, undefined);

        if (result) {
          addItems.push({
            qid: randomUUID(),
            durl: result.flvUrl,
            pic: result.pic,
            type: 'bv',
            id: bvId,
            page: item.index,
            title: item.part
          });
        }
      } catch (err) {
        console.error(err);
      }
    }

    setDownloadAllLoading(false);

    if (addItems.length > 0) {
      dispatch(setAddMoreDownloadLists(addItems));
    }
  }

  // 添加到下载列表
  async function handleAddDownloadQueueClick(o: DownloadItem, event: MouseEvent): Promise<void> {
    try {
      const bvId: string = o.bvid.replace(/^bv/i, '');
      const result: ParseVideoUrlV2ObjectResult | void = await parseVideoUrlV2('bv', bvId, o.index, undefined);

      if (result) {
        dispatch(setAddDownloadList({
          qid: randomUUID(),
          durl: result.flvUrl,
          pic: result.pic,
          type: 'bv',
          id: bvId,
          page: o.index,
          title: o.part
        }));
        messageApi.success('添加到下载队列！');
      } else {
        messageApi.warning('没有获取到媒体地址！');
      }
    } catch (err) {
      console.error(err);
    }
  }

  // 获取数据
  function getData(): void {
    if (!pageQuery.id) return;

    startGetDataTransition(async (): Promise<void> => {
      try {
        const res: SpaceArcSearch = await requestSpaceArcSearch(pageQuery.id!, pageQuery.current);

        if (res.code === 0) {
          setDataSource(res.data.list.vlist ?? res.data.list.vList);
          setTotal(res.data.page.count);
        } else {
          messageApi.error(res.message);
        }
      } catch (err) {
        console.error(err);
      }
    });
  }

  // 解析地址
  function handleGetUrlListClick(record: SpaceArcSearchVListItem, event: MouseEvent): void {
    startGetUrlListTransition(async (): Promise<void> => {
      try {
        const videoList: Array<ParseVideoListArrayItemResult> | void = await parseVideoList(record.bvid);

        setBvVideoList(
          (videoList ?? []).map((o: ParseVideoListArrayItemResult, i: number): DownloadItem =>
            Object.assign(o, {
              bvid: record.bvid,
              index: i + 1
            }))
        );
      } catch (err) {
        console.error(err);
      }
    });
  }

  // 修改页码
  function handlePageChange(page: number, pageSize: number): void {
    setPageQuery((prevState: PageQuery): PageQuery => ({
      ...prevState,
      current: page
    }));
  }

  // 提交和搜索
  function handleSearchSubmit(value: { spaceId: string | undefined }): void {
    if (value.spaceId) {
      setPageQuery({
        current: 1,
        id: value.spaceId
      });
    }
  }

  // 关闭
  function handleCancelClick(event: MouseEvent): void {
    setVisible(false);
  }

  // 渲染下载列表
  function videoListDownloadRender(): Array<ReactNode> {
    return bvVideoList.map((o: DownloadItem, index: number): ReactElement => {
      return (
        <Button key={ o.cid }
          className={ classNames('block text-left', style.downloadBtn) }
          block={ true }
          onClick={ (event: MouseEvent): Promise<void> => handleAddDownloadQueueClick(o, event) }
        >
          { index + 1 }、
          { o.part }
        </Button>
      );
    });
  }

  const columns: ColumnsType<SpaceArcSearchVListItem> = [
    {
      title: '标题',
      dataIndex: 'title'
    },
    {
      title: '操作',
      key: 'handle',
      width: 120,
      render: (value: undefined, record: SpaceArcSearchVListItem, index: number): ReactElement => {
        return (
          <Button size="small"
            onClick={ (event: MouseEvent): void => handleGetUrlListClick(record, event) }
          >
            查看视频
          </Button>
        );
      }
    }
  ];

  useEffect(function(): void {
    getData();
  }, [pageQuery]);

  return (
    <Fragment>
      <Button data-test-id="bilibili-download-add-by-search-btn"
        onClick={ (event: MouseEvent): void => setVisible(true) }
      >
        个人主页批量下载
      </Button>
      <Modal open={ visible }
        title={ [
          '个人主页批量下载',
          <span key="tips" className={ classNames('font-normal', commonStyle.tips) }>（搜索和下载需要先登录）</span>
        ] }
        width={ 800 }
        centered={ true }
        destroyOnClose={ true }
        maskClosable={ false }
        footer={ <Button onClick={ handleCancelClick }>关闭</Button> }
        onCancel={ handleCancelClick }
      >
        <div className="flex flex-col h-[400px]">
          <Form className="shrink-0 mb-[8px]" form={ form } layout="inline" onFinish={ handleSearchSubmit }>
            <Form.Item name="spaceId">
              <Input className="w-[300px]" placeholder="账号ID" />
            </Form.Item>
            <Button htmlType="submit">搜索</Button>
          </Form>
          <div className="flex grow">
            <div className="w-6/12">
              <Table className="w-full"
                size="small"
                columns={ columns }
                dataSource={ dataSource }
                loading={ getDataLoading }
                rowKey="bvid"
                scroll={{ y: 275 }}
                pagination={{
                  current: pageQuery.current,
                  pageSize: 30,
                  showQuickJumper: true,
                  showSizeChanger: false,
                  total,
                  onChange: handlePageChange
                }}
              />
            </div>
            <div className="w-6/12 h-[370px] pl-[12px] overflow-auto">
              {
                getUrlListLoading ? (
                  <div className="text-center">
                    <Spin size="large" tip="解析中..." />
                  </div>
                ) : (
                  <Fragment>
                    {
                      bvVideoList.length > 1 && (
                        <Button className={ classNames('block mb-[6px] text-left', style.downloadBtn) }
                          block={ true }
                          loading={ downloadAllLoading }
                          onClick={ handleAddMoreDownloadQueuesClick }
                        >
                          下载全部
                        </Button>
                      )
                    }
                    { videoListDownloadRender() }
                  </Fragment>
                )
              }
            </div>
          </div>
        </div>
      </Modal>
      { messageContextHolder }
    </Fragment>
  );
}

export default AddBySearch;