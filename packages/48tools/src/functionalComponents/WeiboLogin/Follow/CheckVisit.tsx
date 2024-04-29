import { useState, useEffect, type Dispatch as D, type SetStateAction as S } from 'react';
import { requestDetailByUserId, type FollowContentUserItem, type VisitedSchemaItem, type DetailInfo } from '@48tools-api/weibo';
import type { WeiboAccount } from '../../../commonTypes';

interface CheckVisitProps {
  user: FollowContentUserItem;
  visitedList: Array<VisitedSchemaItem | []>;
  weiboAccount: WeiboAccount;
  detailCache: Record<string, DetailInfo>;
  setDetailCache: D<S<Record<string, DetailInfo>>>;
}

/**
 * 检查是否为访客
 * 先检查粉丝数是否匹配，再通过API获取并检查生日和IP是否匹配
 */
function CheckVisit(props: CheckVisitProps): string | null {
  const { user, visitedList, weiboAccount, detailCache, setDetailCache }: CheckVisitProps = props;
  const [allMatch, setAllMatch]: [boolean, D<S<boolean>>] = useState(false); // 是否全部匹配

  // 通过粉丝数检查是否匹配
  const followersCountMatch: VisitedSchemaItem | undefined = visitedList.find((o: VisitedSchemaItem | []): o is VisitedSchemaItem => {
    if (Array.isArray(o) || !o.recommend) {
      return false;
    }

    const fensishu: string | undefined = o.recommend.find((p: { name: string; value: string }): boolean => p.name.includes('粉丝数'))?.value;

    if (!fensishu) return false;

    return (
      String(user.followers_count) === fensishu
      || String(user.followers_count + 1) === fensishu
      || user.followers_count_str === fensishu
    );
  });

  // 检查生日和IP是否匹配
  async function checkIpAndBirthday(): Promise<void> {
    if (!followersCountMatch) return;

    let res: DetailInfo;

    if (detailCache[user.idstr]) {
      res = detailCache[user.idstr];
    } else {
      res = await requestDetailByUserId(user.idstr, weiboAccount.cookie);
      setDetailCache((prevState: Record<string, DetailInfo>): Record<string, DetailInfo> => ({ ...prevState, [user.idstr]: res }));
    }

    if (res?.data?.birthday && res?.data?.ip_location) {
      const ip: string = res.data.ip_location.replace('IP属地：', '');
      const birthdayMatch: boolean = followersCountMatch.recommend!.some(
        (o: { name: string; value: string }): boolean => o.value === res.data.birthday || res.data.birthday.includes(o.value));
      const ipMatch: boolean = followersCountMatch.recommend!.some((o: { name: string; value: string }): boolean => o.value === ip);

      setAllMatch(followersCountMatch && birthdayMatch && ipMatch);
    }
  }

  useEffect(function(): void {
    checkIpAndBirthday();
  }, [followersCountMatch]);

  if (allMatch) {
    return (followersCountMatch?.recommend ?? []).map((o: { name: string; value: string }): string => o.value).join('，');
  } else {
    return null;
  }
}

export default CheckVisit;