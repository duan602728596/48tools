import { Fragment, useState, useEffect, type ReactElement, type Dispatch as D, type SetStateAction as S, type MouseEvent } from 'react';
import { Button, App, Avatar } from 'antd';
import type { useAppProps } from 'antd/es/app/context';
import { parse } from 'cookie';
import * as classNames from 'classnames';
import {
  requestVisitedList,
  requestSelfFollowedListPC,
  type VisitedList,
  type VisitedSchemaItem,
  type FollowContent,
  type FollowContentUserItem
} from '@48tools-api/weibo';
import style from './follow.sass';
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
  const [visitedIdList, setVisitedIdList]: [Array<VisitedSchemaItem | []>, D<S<Array<VisitedSchemaItem | []>>>] = useState([]); // 访客ID列表
  const [followList, setFollowList]: [Array<FollowContentUserItem>, D<S<Array<FollowContentUserItem>>>] = useState([]); // 关注列表
  const [page, setPage]: [number, D<S<number>>] = useState(1); // 当前页数
  const [loading, setLoading]: [boolean, D<S<boolean>>] = useState(true); // 加载状态

  // 加载访客
  async function loadVisited(): Promise<void> {
    if (!(weiboAccount.s && weiboAccount.from && weiboAccount.c)) {
      messageApi.warning('App相关参数为空！');
      setLoading(false);

      return;
    }

    const cookie: Record<string, string> = parse(weiboAccount.cookie);
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

  // 渲染关注列表
  function followListRender(): Array<ReactElement> {
    return followList.map((item: FollowContentUserItem): ReactElement => {
      return (
        <tr key={ item.id }>
          <td className="w-[30px]">
            <Avatar size="small" src={ item.avatar_hd } />
          </td>
          <td>
            <Button size="small" type="text" onClick={ (event: MouseEvent): void => handleOpenWeiboClick(item.idstr, event) }>
              { item.name }
            </Button>
          </td>
          <td className={ classNames('text-[12px]', commonStyle.primaryText) }>
            <CheckVisit visitedList={ visitedIdList } weiboAccount={ weiboAccount } user={ item } />
          </td>
        </tr>
      );
    });
  }

  useEffect(function(): void {
    loadVisited();
  }, []);

  return (
    <Fragment>
      <div className="shrink-0 pb-[8px] text-right">
        <Button loading={ loading } onClick={ handleLoadFollowListClick }>加载关注列表</Button>
      </div>
      <div className="grow overflow-auto pr-[8px]">
        <table className={ classNames(style.table, commonStyle.text) }>
          <tbody>{ followListRender() }</tbody>
        </table>
      </div>
    </Fragment>
  );
}

export default Follow;