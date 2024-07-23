import type { ReactElement, PropsWithChildren } from 'react';
import { Space, Button, Tooltip, type ButtonProps } from 'antd';
import type { SpaceCompactProps } from 'antd/es/space/Compact';
import { QuestionCircleFilled as IconQuestionCircleFilled } from '@ant-design/icons';
import commonStyle from '../../common.sass';

export interface HelpButtonGroupProps extends PropsWithChildren {
  spaceCompactProps?: SpaceCompactProps;
  buttonProps?: ButtonProps;
  tooltipTitle?: string;
}

/* 帮助 */
function HelpButtonGroup(props: HelpButtonGroupProps): ReactElement {
  const { children, spaceCompactProps = {}, buttonProps = {}, tooltipTitle }: HelpButtonGroupProps = props;

  return (
    <Space.Compact { ...spaceCompactProps }>
      { children }
      <Tooltip title={ tooltipTitle ?? '查看帮助文件' }>
        <Button icon={ <IconQuestionCircleFilled className={ commonStyle.tips } /> } { ...buttonProps } />
      </Tooltip>
    </Space.Compact>
  );
}

export default HelpButtonGroup;