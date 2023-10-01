import { ipcRenderer } from 'electron';
import type { ReactElement, ReactNode, MouseEvent } from 'react';
import * as PropTypes from 'prop-types';
import { Avatar, Button, Tag, Tooltip } from 'antd';
import { ToolTwoTone as IconToolTwoTone } from '@ant-design/icons';
import { WinIpcChannel } from '@48tools/main/src/channelEnum';
import type { LiveRoomInfo } from '@48tools-api/48';
import { source } from '../../../utils/snh48';
import { liveTypeRender } from '../../48/components/LiveType/LiveType';
import type { PlayerInfo } from '../../../components/basic/initialState/initialState';

interface LiveInfoProps {
  playerInfo: PlayerInfo;
  info: LiveRoomInfo | undefined;
}

/* 显示直播信息 */
function LiveInfo(props: LiveInfoProps): ReactElement {
  const { playerInfo, info }: LiveInfoProps = props;

  // 打开开发者工具
  function handleOpenDeveloperToolsClick(event: MouseEvent): void {
    ipcRenderer.send(WinIpcChannel.PlayerDeveloperTools, playerInfo.id);
  }

  // 渲染小偶像信息
  function infoRender(): Array<ReactNode> | null {
    if (!info) return null;

    const { content }: LiveRoomInfo = info;

    return [
      <Avatar key="avatar" src={ source(content.user.userAvatar) } />,
      <span key="username" className="ml-[6px] text-[12px]">
        { content.user.userName }
      </span>
    ];
  }

  //

  return (
    <header className="shrink-0 mb-[8px]">
      <h1 className="inline-block mb-[8px] mr-[6px] text-[16px]">{ playerInfo.title }</h1>
      { playerInfo.liveMode === 1 ? <Tag color="blue">录屏</Tag> : liveTypeRender(playerInfo.liveType) }
      <div className="flex">
        <div className="grow">{ infoRender() }</div>
        <div className="shrink-0">
          <Tooltip title="开发者工具">
            <Button type="text" icon={ <IconToolTwoTone /> } aria-label="开发者工具" onClick={ handleOpenDeveloperToolsClick } />
          </Tooltip>
        </div>
      </div>
    </header>
  );
}

LiveInfo.propTypes = {
  playerInfo: PropTypes.object,
  info: PropTypes.object
};

export default LiveInfo;