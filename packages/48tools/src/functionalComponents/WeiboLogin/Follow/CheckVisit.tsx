import {
  Fragment,
  useState,
  useEffect,
  useTransition,
  type ReactElement,
  type Dispatch as D,
  type SetStateAction as S,
  type TransitionStartFunction
} from 'react';
import { Button } from 'antd';
import * as dayjs from 'dayjs';
import * as customParseFormat from 'dayjs/plugin/customParseFormat';
import { requestDetailByUserId, type FollowContentUserItem, type VisitedSchemaItem, type DetailInfo } from '@48tools-api/weibo';
import commonStyle from '../../../common.sass';
import type { WeiboAccount } from '../../../commonTypes';

dayjs.extend(customParseFormat);

/* 请求较多，需要缓存 */
const userDetailCache: Record<string, DetailInfo> = {};

interface CheckVisitProps {
  user: FollowContentUserItem;
  visitedList: Array<VisitedSchemaItem | []>;
  weiboAccount: WeiboAccount;
}

/**
 * 检查是否为访客
 * 先检查粉丝数是否匹配，再通过API获取并检查生日和IP是否匹配
 */
function CheckVisit(props: CheckVisitProps): ReactElement | null {
  const { user, visitedList, weiboAccount }: CheckVisitProps = props;
  const [matchVisited, setMatchVisited]: [VisitedSchemaItem | null, D<S<VisitedSchemaItem | null>>] = useState<VisitedSchemaItem | null>(null);
  const [userTags, setUserTags]: [string | null, D<S<string | null>>] = useState<string | null>(null);
  const [checkLoading, startCheckTransition]: [boolean, TransitionStartFunction] = useTransition();

  // 检查是否匹配
  function handleCheckVisitMatchingClick(): void {
    startCheckTransition(async (): Promise<void> => {
      let res: DetailInfo;

      if (userDetailCache[user.idstr]) {
        res = userDetailCache[user.idstr];
      } else {
        res = await requestDetailByUserId(user.idstr, weiboAccount.cookie);

        if ('data' in res) userDetailCache[user.idstr] = res;
      }

      const ip: string | undefined = typeof res.data.ip_location === 'string' ? res.data.ip_location.replace('IP属地：', '') : undefined;
      const followersCountMatchVisited: VisitedSchemaItem | undefined = visitedList.find((o: VisitedSchemaItem | []): o is VisitedSchemaItem => {
        if (Array.isArray(o) || !o.recommend) return false;

        // 匹配星座
        const birthdayMatch: boolean = o.recommend.some((p: { name: string; value: string }): boolean => res.data.birthday.includes(p.value));
        // 匹配ID
        const ipMatch: boolean = !!(ip && o.region && o.region === ip);
        // 检查信用
        const sunshineCredit: string | undefined = o.sunshine ? o.sunshine.replace('阳光', '') : undefined;
        let sunshineCreditMatch: boolean = true;

        if (sunshineCredit && res.data?.sunshine_credit?.level) {
          sunshineCreditMatch = sunshineCredit === res.data?.sunshine_credit.level;
        }

        return birthdayMatch && ipMatch && sunshineCreditMatch;
      });

      if (followersCountMatchVisited) {
        setMatchVisited((prevState: VisitedSchemaItem | null): VisitedSchemaItem | null => followersCountMatchVisited);
      } else {
        const tags: Array<string> = [];

        if (ip) tags.push(ip);

        if (res.data.birthday && !/^\s*$/.test(res.data.birthday)) tags.push(res.data.birthday);

        if (res.data?.sunshine_credit?.level) tags.push(res.data?.sunshine_credit?.level);

        setUserTags((prevState: string | null): string | null => tags.join('，'));
      }
    });
  }

  // 输出匹配的状态
  function matchVisitedTags(): ReactElement | string | null {
    if (!matchVisited) return userTags;

    const tags: Array<string> = [dayjs(matchVisited.visit_day, 'YYYYMMDD').format('YYYY-MM-DD')];

    if (matchVisited.region) tags.push(matchVisited.region);

    if (matchVisited.recommend?.length) {
      tags.push(...matchVisited.recommend.map((o: { name: string; value: string }): string => o.value));
    }

    return <span className={ commonStyle.primaryText }>{ tags.join('，') }</span>;
  }

  useEffect(function(): void {
    if (userDetailCache[user.idstr]) {
      handleCheckVisitMatchingClick();
    }
  }, [user]);

  return (
    <Fragment>
      <Button className="mr-[8px]" size="small" loading={ checkLoading } onClick={ handleCheckVisitMatchingClick }>检查</Button>
      { matchVisitedTags() }
    </Fragment>
  );
}

export default CheckVisit;