import { ipcRenderer } from 'electron';
import {
  Fragment,
  useState,
  type ReactElement,
  type ReactNode,
  type Dispatch as D,
  type SetStateAction as S,
  type MouseEvent
} from 'react';
import * as PropTypes from 'prop-types';
import { Avatar, Button, Tag, Tooltip, Space, message } from 'antd';
import type { UseMessageReturnType } from '@48tools-types/antd';
import {
  ToolTwoTone as IconToolTwoTone,
  UnorderedListOutlined as IconUnorderedListOutlined,
  StopOutlined as IconStopOutlined
} from '@ant-design/icons';
import { source } from '../../../utils/snh48';
import { getDanmuLocal, setDanmuLocal } from '../function/danmuLocal';
import type { PlayerInfo } from '../PlayerWindow';
import type { LiveRoomInfo } from '../../48/services/interface';

interface LiveInfoProps {
  playerInfo: PlayerInfo;
  info: LiveRoomInfo | undefined;
}

/* 显示直播信息 */
function LiveInfo(props: LiveInfoProps): ReactElement {
  const { playerInfo, info }: LiveInfoProps = props;
  const [messageApi, messageContextHolder]: UseMessageReturnType = message.useMessage();
  const [dl, setDl]: [boolean, D<S<boolean>>] = useState(getDanmuLocal());

  // 设置弹幕
  function handleDanmuSwitchClick(value: boolean, event: MouseEvent): void {
    setDl(value);
    setDanmuLocal(value);
    messageApi.info(`${ value ? '开启' : '关闭' }弹幕加载，下次观看录播时生效。`);
  }

  // 打开开发者工具
  function handleOpenDeveloperToolsClick(event: MouseEvent): void {
    ipcRenderer.send('player-developer-tools', playerInfo.id);
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

  return (
    <Fragment>
      <header className="shrink-0 mb-[8px]">
        <h1 className="inline-block mb-[8px] mr-[6px] text-[16px]">{ playerInfo.title }</h1>
        {
          playerInfo.liveMode === 1
            ? <Tag color="blue">录屏</Tag>
            : (playerInfo.liveType === 2 ? <Tag color="volcano">电台</Tag> : <Tag color="purple">视频</Tag>)
        }
        <div className="flex">
          <div className="grow">{ infoRender() }</div>
          <div className="shrink-0">
            <Space>
              {
                dl ? (
                  <Tooltip title="关闭弹幕加载功能">
                    <Button type="primary"
                      danger={ true }
                      icon={ <IconStopOutlined /> }
                      aria-label="关闭弹幕加载功能"
                      onClick={ (event: MouseEvent): void => handleDanmuSwitchClick(false, event) }
                    />
                  </Tooltip>
                ) : (
                  <Tooltip title="开启弹幕加载功能">
                    <Button type="primary"
                      icon={ <IconUnorderedListOutlined /> }
                      aria-label="开启弹幕加载功能"
                      onClick={ (event: MouseEvent): void => handleDanmuSwitchClick(true, event) }
                    />
                  </Tooltip>
                )
              }
              <Tooltip title="开发者工具">
                <Button type="text" icon={ <IconToolTwoTone /> } aria-label="开发者工具" onClick={ handleOpenDeveloperToolsClick } />
              </Tooltip>
            </Space>
          </div>
        </div>
      </header>
      { messageContextHolder }
    </Fragment>
  );
}

LiveInfo.propTypes = {
  playerInfo: PropTypes.object,
  info: PropTypes.object
};

export default LiveInfo;