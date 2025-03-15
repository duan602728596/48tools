import { randomUUID } from 'node:crypto';
import {
  Fragment,
  useState,
  useEffect,
  useTransition,
  type ReactElement,
  type Dispatch as D,
  type SetStateAction as S,
  type MouseEvent,
  type TransitionStartFunction
} from 'react';
import { useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { Button, Modal, Input, Form, Table, Spin, message, List, type FormInstance } from 'antd';
import type { UseMessageReturnType } from '@48tools-types/antd';
import type { ColumnsType } from 'antd/es/table';
import classNames from 'classnames';
import {
  requestSpaceArcSearch,
  type SpaceArcSearchVListItem,
  type SpaceArcSearch
} from '@48tools-api/bilibili/download';
import commonStyle from '../../../../common.sass';
import style from './addBySearch.sass';
import { setAddDownloadList, setAddMoreDownloadLists } from '../../reducers/bilibiliDownload';
import DASHSelect from './DASHSelect';
import {
  BilibiliScrapy,
  BilibiliVideoType,
  type BilibiliVideoInfoItem,
  type BilibiliVideoResultItem
} from '../../../../scrapy/bilibili/BilibiliScrapy';
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

    const bvid: string = bvVideoList[0].bvid.replace(/^bv/i, '');
    const bilibiliScrapy: BilibiliScrapy = new BilibiliScrapy({
      type: BilibiliVideoType.BV,
      id: bvid
    });

    await bilibiliScrapy.parse();

    for (const downloadItem of bvVideoList) {
      try {
        await bilibiliScrapy.asyncLoadVideoInfoByPage(downloadItem.index);

        const videoResultItem: BilibiliVideoResultItem = bilibiliScrapy.findVideoResult(downloadItem.index);
        const videoInfoItem: BilibiliVideoInfoItem = bilibiliScrapy.findVideoInfo(downloadItem.index);
        const obj: {
          dash?: { video: string; audio: string };
          durl: string;
        } = videoInfoItem.audioUrl ? {
          dash: {
            video: videoInfoItem.videoUrl,
            audio: videoInfoItem.audioUrl!
          },
          durl: ''
        } : {
          durl: videoInfoItem.videoUrl
        };

        addItems.push({
          qid: randomUUID(),
          pic: videoResultItem.cover,
          type: BilibiliVideoType.BV,
          id: bvid,
          page: downloadItem.index,
          title: videoResultItem.title,
          ...obj
        });
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
      const bilibiliScrapy: BilibiliScrapy = new BilibiliScrapy({
        type: BilibiliVideoType.BV,
        id: bvId,
        page: o.index
      });

      await bilibiliScrapy.parse();
      await bilibiliScrapy.asyncLoadVideoInfoByPage();

      if (bilibiliScrapy.error) {
        messageApi[bilibiliScrapy.error.level](bilibiliScrapy.error.message);

        return;
      }

      const videoResultItem: BilibiliVideoResultItem = bilibiliScrapy.findVideoResult();
      const videoInfoItem: BilibiliVideoInfoItem = bilibiliScrapy.findVideoInfo();
      const obj: {
        dash?: { video: string; audio: string };
        durl: string;
      } = videoInfoItem.audioUrl ? {
        dash: {
          video: videoInfoItem.videoUrl,
          audio: videoInfoItem.audioUrl!
        },
        durl: ''
      } : {
        durl: videoInfoItem.videoUrl
      };

      dispatch(setAddDownloadList({
        qid: randomUUID(),
        pic: videoResultItem.cover,
        type: BilibiliVideoType.BV,
        id: bvId,
        page: o.index,
        title: o.part,
        ...obj
      }));
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
        const bilibiliScrapy: BilibiliScrapy = new BilibiliScrapy({
          url: `https://www.bilibili.com/video/${ record.bvid }`
        });

        await bilibiliScrapy.parse();

        if (bilibiliScrapy.error) {
          messageApi[bilibiliScrapy.error.level](bilibiliScrapy.error.message);

          return;
        }

        setBvVideoList(
          bilibiliScrapy.videoResult.map((o: BilibiliVideoResultItem, i: number): DownloadItem => ({
            cid: o.cid,
            part: o.title,
            bvid: o.bvid,
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
  function videoListDownloadRender(o: DownloadItem, index: number): ReactElement {
    return (
      <List.Item key={ o.cid } className="px-0">
        <div className="flex w-full">
          <div className="shrink-0 grow-0 mr-[6px] w-4/6">
            <Button className={ classNames('block text-left', style.downloadBtn) }
              block={ true }
              onClick={ (event: MouseEvent): Promise<void> => handleAddDownloadQueueClick(o, event) }
            >
              { index + 1 }、
              { o.part }
            </Button>
          </div>
          <div className="shrink-0 grow-0 w-2/6">
            <DASHSelect id={ o.bvid } page={ o.index } />
          </div>
        </div>
      </List.Item>
    );
  }

  const columns: ColumnsType<SpaceArcSearchVListItem> = [
    {
      title: '操作',
      dataIndex: 'title',
      key: 'handle',
      render: (value: string, record: SpaceArcSearchVListItem, index: number): ReactElement => {
        return (
          <Button className={ style.downloadBtn }
            size="small"
            block={ true }
            onClick={ (event: MouseEvent): void => handleGetUrlListClick(record, event) }
          >
            { value }
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
        width={ 900 }
        centered={ true }
        destroyOnClose={ true }
        maskClosable={ false }
        footer={ <Button onClick={ handleCancelClick }>关闭</Button> }
        onCancel={ handleCancelClick }
      >
        <div className="flex flex-col h-[500px]">
          <Form className="shrink-0 mb-[8px]" form={ form } layout="inline" onFinish={ handleSearchSubmit }>
            <Form.Item name="spaceId">
              <Input className="w-[204px]" placeholder="账号ID" />
            </Form.Item>
            <Button htmlType="submit">搜索</Button>
          </Form>
          <div className="flex grow">
            <div className="w-4/12">
              <Table className="w-full"
                size="small"
                columns={ columns }
                dataSource={ dataSource }
                loading={ getDataLoading }
                rowKey="bvid"
                scroll={{ y: 380 }}
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
            <div className="w-8/12 h-[460px] pl-[12px] overflow-auto">
              {
                getUrlListLoading ? (
                  <div className="text-center">
                    <Spin size="large" />
                    <span className="ml-[24px]">解析中...</span>
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
                          <span className={ commonStyle.tips }>（暂不支持选择分辨率）</span>
                        </Button>
                      )
                    }
                    <List size="small" bordered={ true } dataSource={ bvVideoList } renderItem={ videoListDownloadRender } />
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