import type { SaveDialogReturnValue } from 'electron';
import { useMemo, useTransition, type ReactElement, type MouseEvent, type TransitionStartFunction } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { createStructuredSelector, type Selector } from 'reselect';
import { Space, Form, Input, Button, App, Empty, Card, type FormInstance } from 'antd';
import type { useAppProps } from 'antd/es/app/context';
import VirtualList from 'rc-virtual-list';
import * as dayjs from 'dayjs';
import {
  requestWeiboUserImages,
  requestWeiboShow,
  type WeiboUserImages,
  type WeiboShowDetails,
  type WeiboShowDetailsInfo
} from '@48tools-api/weibo';
import commonStyle from '../../../common.sass';
import { showSaveDialog } from '../../../utils/remote/dialog';
import { nativeMessage } from '../../../utils/remote/nativeMessage';
import Header from '../../../components/Header/Header';
import Content from '../../../components/Content/Content';
import WeiboLoginDynamic from '../../../functionalComponents/WeiboLogin/loader';
import AccountSelect from '../components/AccountSelect/AccountSelect';
import { updateNextStatus, setImagesList, selectorsObject, setClearAllChecked, type WeiboImagesDownloadInitialState } from '../reducers/weiboImagesDownload';
import ImagesGroup from './ImagesGroup';
import dynamicReducers from '../../../store/dynamicReducers';
import weiboImagesDownloadReducers from '../reducers/weiboImagesDownload';
import { fileTimeFormat } from '../../../utils/utils';
import getDownloadWorker from './download.worker/getDownloadWorker';
import { pick } from '../../../utils/lodash';
import type { WeiboImageItem, WeiboImagesGroup } from '../types';
import type { WeiboLoginInitialState } from '../../../functionalComponents/WeiboLogin/reducers/weiboLogin';
import type { WeiboAccount } from '../../../commonTypes';

/* redux selector */
type RSelector = WeiboImagesDownloadInitialState & WeiboLoginInitialState;
type RState = {
  weiboImagesDownload: WeiboImagesDownloadInitialState;
  weiboLogin: WeiboLoginInitialState;
};

const selector: Selector<RState, RSelector> = createStructuredSelector({
  ...selectorsObject,

  // 微博已登陆账号
  accountList: ({ weiboLogin }: RState): Array<WeiboAccount> => weiboLogin?.accountList
});

/* 微博图片下载 */
function ImagesDownload(props: {}): ReactElement {
  const { accountId, sinceId, cookie, list, accountList }: RSelector = useSelector(selector);
  const dispatch: Dispatch = useDispatch();
  const { message: messageApi }: useAppProps = App.useApp();
  const [form]: [FormInstance] = Form.useForm();
  const [imageLoading, startImageLoadingTransition]: [boolean, TransitionStartFunction] = useTransition();

  // 对list进行分组，6个为一组
  const listGroup: Array<WeiboImagesGroup> = useMemo(function(): Array<WeiboImagesGroup> {
    const newList: Array<WeiboImagesGroup> = [];
    let index: number = 0;

    for (const item of list) {
      if (index === 0) newList.push({ pids: '', items: [] });

      newList.at(-1)!.items.push(item);

      if (index === 5) {
        newList.at(-1)!.pids = newList.at(-1)!.items.map((p: WeiboImageItem) => p.pid).join('_');
        index = 0;
      } else {
        index++;
      }
    }

    return newList;
  }, [list]);

  /**
   * 加载图片
   * @param { string } uid - 用户id
   * @param { string } c - cookie
   * @param { string } sid - 起始id
   * @param { boolean } init - 是否是初始化加载
   */
  function getImages(uid: string, c: string, sid: string, init: boolean): void {
    startImageLoadingTransition(async (): Promise<void> => {
      const cacheObject: Record<string, WeiboShowDetailsInfo> = {};

      try {
        // 请求图片
        const res: WeiboUserImages = await requestWeiboUserImages(uid, sid, c);

        if (!res?.data?.list?.length) {
          messageApi.error('没有图片！请检查微博uid填写是否正确！');

          return;
        }

        const midSet: Set<string> = new Set<string>();

        for (const r of res.data.list) {
          midSet.add(r.mid);
        }

        // 请求图片详细信息
        const showPromiseAll: Array<PromiseLike<WeiboShowDetails>> = [];

        for (const mid of midSet) {
          showPromiseAll.push(requestWeiboShow(mid, c));
        }

        const showRes: Array<WeiboShowDetails> = await Promise.all(showPromiseAll);

        for (const r of showRes) {
          if (r.pic_infos) {
            Object.assign(cacheObject, r.pic_infos);
          } else if (r.mix_media_info) {
            for (const m of r.mix_media_info.items) {
              cacheObject[m.data.pic_id] = m.data;
            }
          }
        }

        // 更新图片列表
        const updateImagesList: Array<WeiboImageItem> = [];

        for (const r of res.data.list) {
          updateImagesList.push({
            pid: r.pid,
            type: r.type,
            infos: {
              thumbnail: pick(cacheObject[r.pid].thumbnail, ['url']),
              largest: pick(cacheObject[r.pid].largest, ['url']),
              video: cacheObject[r.pid].video
            },
            checked: false
          });
        }

        dispatch(setImagesList({ sinceId: res.data.since_id, list: updateImagesList, isInit: init }));
      } catch (err) {
        console.error(err);
        messageApi.error('图片加载失败！');
      }
    });
  }

  // 加载下一页
  function handleGetNextImagesClick(event: MouseEvent): void {
    if (accountId && !/^\s*$/.test(accountId) && sinceId && cookie) {
      getImages(accountId, cookie, sinceId, false);
    }
  }

  // 下载图片
  function handleImagesDownloadClick(event: MouseEvent): void {
    const { account, userId }: Partial<{ account: string; userId: string }> = form.getFieldsValue();
    const item: WeiboAccount | undefined = accountList.find((o: WeiboAccount): boolean => o.id === account);

    if (userId && !/^\s*$/.test(userId) && item) {
      dispatch(updateNextStatus({ accountId: userId, cookie: item.cookie, sinceId: '0' }));
      getImages(userId, item.cookie, '0', true);
    }
  }

  // 清空所有选中
  function handleClearAllCheckedClick(): void {
    dispatch(setClearAllChecked());
  }

  // 下载选中图片
  async function handleDownloadCheckedImagesClick(event: MouseEvent): Promise<void> {
    const checkedList: Array<WeiboImageItem> = list.filter((o: WeiboImageItem): boolean => !!o.checked);

    if (checkedList.length <= 0) return;

    const time: string = dayjs().format(fileTimeFormat);
    const result: SaveDialogReturnValue = await showSaveDialog({
      properties: ['createDirectory'],
      defaultPath: `微博图片下载_${ accountId }_${ time }`
    });

    if (result.canceled || !result.filePath) return;

    messageApi.info('开始下载微博图片，请等待。');

    const worker: Worker = getDownloadWorker();

    worker.addEventListener('message', function(e: MessageEvent): void {
      worker.terminate();
      nativeMessage('微博图片下载完成！');
      handleClearAllCheckedClick();
    });

    worker.postMessage({
      filePath: result.filePath,
      checkedList
    });
  }

  return (
    <Content>
      <Header>
        <Form form={ form }>
          <div className="mb-[8px]">
            <Space>
              <Form.Item name="account" noStyle={ true }>
                <AccountSelect />
              </Form.Item>
              <WeiboLoginDynamic />
            </Space>
          </div>
          <div>
            <Space>
              <Form.Item name="userId" noStyle={ true }>
                <Input className="w-[200px]" placeholder="输入微博账号的UID" />
              </Form.Item>
              <Button loading={ imageLoading } onClick={ handleImagesDownloadClick }>刷新</Button>
            </Space>
          </div>
        </Form>
      </Header>
      <Space>
        <Card size="small">
          <div className="w-[600px] h-[600px] overflow-hidden select-none">
            {
              listGroup.length === 0 ? <Empty className="mt-[215px]" /> : (
                <VirtualList data={ listGroup } height={ 600 } itemHeight={ 100 } itemKey="pids">
                  {
                    (item: WeiboImagesGroup, index: number): ReactElement =>
                      <ImagesGroup key={ item.pids } item={ item } index={ index } />
                  }
                </VirtualList>
              )
            }
          </div>
        </Card>
        <Space direction="vertical">
          <p className={ commonStyle.tips }>
            需要微博账号登录后才能下载。<br />
            鼠标左键点击预览图片。<br />
            鼠标右键点击选中要下载的图片。<br />
            下载完毕后会清空所有选中。
          </p>
          <Button onClick={ handleDownloadCheckedImagesClick }>下载选中的图片</Button>
          <Button onClick={ handleClearAllCheckedClick }>清空所有选中</Button>
          <Button type="primary" loading={ imageLoading } onClick={ handleGetNextImagesClick }>加载下一页</Button>
        </Space>
      </Space>
    </Content>
  );
}

export default dynamicReducers([weiboImagesDownloadReducers])(ImagesDownload);