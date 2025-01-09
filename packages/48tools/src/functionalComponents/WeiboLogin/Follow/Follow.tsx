import {
  Fragment,
  useState,
  useEffect,
  useRef,
  type ReactElement,
  type Dispatch as D,
  type SetStateAction as S,
  type MouseEvent,
  type RefObject
} from 'react';
import { Button, App, Avatar, Alert } from 'antd';
import type { useAppProps } from 'antd/es/app/context';
import VirtualList from 'rc-virtual-list';
import classNames from 'classnames';
import { parse as cookieParse } from 'cookie';
import {
  requestSelfFollowedListPC,
  requestVisitedList,
  type FollowContent,
  type FollowContentUserItem,
  type VisitedSchemaItem,
  type VisitedList
} from '@48tools-api/weibo';
import commonStyle from '../../../common.sass';
import CheckVisit from './CheckVisit';
import { handleOpenWeiboClick } from '../function/weiboHelper';
import type { WeiboAccount } from '../../../commonTypes';

interface FollowProps {
  weiboAccount: WeiboAccount;
}

/* 加载关注的人，并解析访客 */
function Follow(props: FollowProps): ReactElement {
  const { weiboAccount }: FollowProps = props;
  const { message: messageApi }: useAppProps = App.useApp();
  const [followList, setFollowList]: [Array<FollowContentUserItem>, D<S<Array<FollowContentUserItem>>>] = useState([]); // 关注列表
  const [visitedIdList, setVisitedIdList]: [Array<VisitedSchemaItem | []>, D<S<Array<VisitedSchemaItem | []>>>] = useState([]); // 访客ID列表
  const [page, setPage]: [number, D<S<number>>] = useState(1); // 当前页数
  const [loading, setLoading]: [boolean, D<S<boolean>>] = useState(false); // 加载状态
  const [listHeight, setListHeight]: [number, D<S<number>>] = useState(0);
  const resizeObserverRef: RefObject<ResizeObserver | null> = useRef(null);
  const listRef: RefObject<HTMLDivElement | null> = useRef(null);

  // 加载访客
  async function loadVisited(): Promise<void> {
    if (!(weiboAccount.s && weiboAccount.from && weiboAccount.c)) {
      messageApi.warning('App相关参数为空！');
      setLoading(false);

      return;
    }

    const cookie: Record<string, string> = cookieParse(weiboAccount.cookie);
    const subCookie: string | undefined = cookie.SUB;

    if (!subCookie) {
      messageApi.warning('Cookie中没有SUB字段！');
      setLoading(false);

      return;
    }

    try {
      const res: VisitedList = await requestVisitedList(subCookie, weiboAccount.s, weiboAccount.from, weiboAccount.c);

      if (res.errno || res.errmsg) {
        messageApi.error(res.errmsg ?? '访客列表获取失败！');
        setLoading(false);

        return;
      }

      const result: Array<VisitedSchemaItem | []> = res?.data?.data ?? [];

      setVisitedIdList(result);

      if (result.length === 0) {
        messageApi.info('没有访客！');
      }
    } catch (error) {
      console.error(error);
      messageApi.error('加载访客列表失败！请推出后重新进入。');
    }

    setLoading(false);
  }

  // 加载关注的人
  async function handleLoadFollowListClick(event: MouseEvent): Promise<void> {
    setLoading(true);

    try {
      const res: FollowContent = await requestSelfFollowedListPC(weiboAccount.cookie, page);

      if (res?.data?.follows?.users) {
        const users: Array<FollowContentUserItem> = res?.data?.follows?.users ?? [];

        setFollowList((prevState: Array<FollowContentUserItem>): Array<FollowContentUserItem> => prevState.concat(users));

        if (users.length) {
          setPage((prevState: number): number => prevState + 1);
        }
      } else {
        messageApi.error('加载关注列表失败！');
      }
    } catch (err) {
      console.error(err);
      messageApi.error('加载关注列表出现错误！');
    }

    setLoading(false);
  }

  // 监听高度
  function handleResizeObserverCallback(entries: ResizeObserverEntry[], observer: ResizeObserver): void {
    setListHeight((prevState: number): number => entries[0].contentRect.height);
  }

  useEffect(function(): void {
    loadVisited();
  }, []);

  useEffect(function(): () => void {
    resizeObserverRef.current = new ResizeObserver(handleResizeObserverCallback);
    listRef.current && resizeObserverRef.current.observe(listRef.current);

    return function(): void {
      resizeObserverRef.current?.disconnect?.();
      resizeObserverRef.current = null;
    };
  }, []);

  return (
    <Fragment>
      <div className="flex shrink-0 pb-[8px] text-right">
        <Alert type="warning" message="这里只列出可能匹配的访客，不一定准确。检查需要点击“检查”，否则可能会被风控。" />
        <div className="grow content-center text-right">
          <Button loading={ loading } onClick={ handleLoadFollowListClick }>加载关注列表</Button>
        </div>
      </div>
      <div ref={ listRef } className="grow overflow-hidden pr-[8px]">
        <VirtualList data={ followList } height={ listHeight } itemHeight={ 30 } itemKey="id">
          {
            (item: FollowContentUserItem): ReactElement => (
              <div key={ item.id } className={ classNames('flex h-[30px]', commonStyle.text) }>
                <div className="shrink-0 content-center">
                  <Avatar size="small" src={ item.avatar_hd } />
                </div>
                <div className="shrink-0 pl-[8px] content-center">
                  <Button size="small" type="text" onClick={ (event: MouseEvent): void => handleOpenWeiboClick(item.idstr, event) }>
                    { item.name }
                  </Button>
                </div>
                <div className="shrink-0 pl-[8px] content-center">
                  <CheckVisit visitedList={ visitedIdList } weiboAccount={ weiboAccount } user={ item } />
                </div>
              </div>
            )
          }
        </VirtualList>
      </div>
    </Fragment>
  );
}

export default Follow;