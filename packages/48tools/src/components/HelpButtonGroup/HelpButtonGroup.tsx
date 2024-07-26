import { ipcRenderer } from 'electron';
import type { ReactElement, PropsWithChildren, MouseEvent } from 'react';
import { Space, Button, Tooltip, type ButtonProps } from 'antd';
import type { SpaceCompactProps } from 'antd/es/space/Compact';
import { QuestionCircleFilled as IconQuestionCircleFilled } from '@ant-design/icons';
import commonStyle from '../../common.sass';
import { HelpChannel } from '../../../../main/src/channelEnum';

export interface HelpButtonGroupProps extends PropsWithChildren {
  spaceCompactProps?: SpaceCompactProps;
  buttonProps?: ButtonProps;
  tooltipTitle?: string;
  navId?: string;
}

/* 帮助 */
function HelpButtonGroup(props: HelpButtonGroupProps): ReactElement {
  const { children, spaceCompactProps = {}, buttonProps = {}, tooltipTitle, navId }: HelpButtonGroupProps = props;

  // 点击后激活跳转help对应的page
  function handleOpenHelpPageClick(event: MouseEvent): void {
    ipcRenderer.invoke(HelpChannel.Help, { navId });
  }

  return (
    <Space.Compact { ...spaceCompactProps }>
      { children }
      <Tooltip title={ tooltipTitle ?? '查看帮助文件' }>
        <Button icon={ <IconQuestionCircleFilled className={ commonStyle.tips } /> }
          onClick={ handleOpenHelpPageClick }
          { ...buttonProps }
        />
      </Tooltip>
    </Space.Compact>
  );
}

export default HelpButtonGroup;