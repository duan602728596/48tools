import { Fragment, useState, useEffect, type ReactElement, type Dispatch as D, type SetStateAction as S } from 'react';
import { Alert } from 'antd';
import classNames from 'classnames';
import { requestLiveRoomInfo, type LiveRoomInfo } from '@48tools-api/48';
import commonStyle from '../../common.sass';
import LiveInfo from './LiveInfo/LiveInfo';
import LiveVideo from './Video/LiveVideo';
import RecordVideo from './Video/RecordVideo';
import RecordDanmu from './Danmu/RecordDanmu';
import Damu from './Danmu/Danmu';
import { getUserInfo } from './function/helper';
import { Pocket48Login } from '../../functionalComponents/Pocket48Login/enum';
import { nodeNim } from './sdk/NodeNimChatroomSocket';
import type { PlayerInfo } from '../../components/basic/initialState/initialState';
import type { UserInfo } from '../../functionalComponents/Pocket48Login/types';

const playerInfo: PlayerInfo = globalThis.__INITIAL_STATE__.playerInfo;
const inRecord: boolean = playerInfo.playerType === 'record';

/* 直播窗口 */
function PlayerWindow(props: {}): ReactElement {
  const [info, setInfo]: [LiveRoomInfo | undefined, D<S<LiveRoomInfo | undefined>>] = useState(undefined); // 直播信息

  // 请求直播间信息
  async function getLiveRoomInfo(): Promise<void> {
    try {
      const res: LiveRoomInfo = await requestLiveRoomInfo(playerInfo.liveId);

      console.log(res.content);
      setInfo(res);
    } catch (err) {
      console.error(err);
    }
  }

  // 渲染弹幕
  function danmuRender(): ReactElement | null {
    if (inRecord) {
      return <RecordDanmu info={ info } />;
    }

    if (!nodeNim) {
      return (
        <Alert type="error" message={
          <Fragment>
            <p>您使用的软件支持的操作系统是Windows，CPU架构是ARM64。网易云信SDK暂不支持该系统的架构。</p>
            <p>如果您需要弹幕功能，可以尝试使用x64架构的Windows系统，或者使用其他支持的操作系统。或尝试使用x64架构的软件。</p>
          </Fragment>
        } />
      );
    }

    const userInfo: UserInfo | null = getUserInfo();

    if (!userInfo) {
      return <Alert type="error" message={ <p>弹幕功能需要先登录口袋48账号后，重新进入直播间。</p> } />;
    }

    const appDataDir: string | null = localStorage.getItem(Pocket48Login.AppDataDir);

    if (!appDataDir) {
      return (
        <Alert type="error" message={
          <Fragment>
            <p>最新的网易云信SDK需要手动配置App Data目录后才能使用。</p>
            <p>您需要配置后才能使用弹幕功能。</p>
          </Fragment>
        } />
      );
    }

    return <Damu info={ info } userInfo={ userInfo } appDataDir={ appDataDir } />;
  }

  useEffect(function(): void {
    getLiveRoomInfo();
  }, []);

  return (
    <div className={ classNames('flex w-full h-full', commonStyle.text) }>
      <div className="flex flex-col grow p-[16px] box-border h-full">
        <LiveInfo playerInfo={ playerInfo } info={ info } />
        {
          inRecord
            ? <RecordVideo playerInfo={ playerInfo } info={ info } />
            : <LiveVideo playerInfo={ playerInfo } info={ info } />
        }
      </div>
      <div className="flex flex-col shrink-0 box-border pr-[16px] pt-[16px] pb-[16px] w-[300px] h-full text-[12px]">
        { danmuRender() }
      </div>
    </div>
  );
}

export default PlayerWindow;