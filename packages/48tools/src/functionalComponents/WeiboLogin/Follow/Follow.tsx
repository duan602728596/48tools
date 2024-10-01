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
import { Button, App, Avatar } from 'antd';
import type { useAppProps } from 'antd/es/app/context';
import VirtualList from 'rc-virtual-list';
import classNames from 'classnames';
import { requestSelfFollowedListPC, type FollowContent, type FollowContentUserItem } from '@48tools-api/weibo';
import commonStyle from '../../../common.sass';
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
  const [page, setPage]: [number, D<S<number>>] = useState(1); // 当前页数
  const [loading, setLoading]: [boolean, D<S<boolean>>] = useState(false); // 加载状态
  const [listHeight, setListHeight]: [number, D<S<number>>] = useState(0);
  const resizeObserverRef: RefObject<ResizeObserver | null> = useRef(null);
  const listRef: RefObject<HTMLDivElement | null> = useRef(null);

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
      <div className="shrink-0 pb-[8px] text-right">
        <Button loading={ loading } onClick={ handleLoadFollowListClick }>加载关注列表</Button>
      </div>
      <div ref={ listRef } className="grow overflow-hidden pr-[8px]">
        <VirtualList data={ followList } height={ listHeight } itemHeight={ 26 } itemKey="id">
          {
            (item: FollowContentUserItem): ReactElement => (
              <div key={ item.id } className={ classNames('flex h-[26px]', commonStyle.text) }>
                <div className="shrink-0">
                  <Avatar size="small" src={ item.avatar_hd } />
                </div>
                <div className="shrink-0 pl-[8px]">
                  <Button size="small" type="text" onClick={ (event: MouseEvent): void => handleOpenWeiboClick(item.idstr, event) }>
                    { item.name }
                  </Button>
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