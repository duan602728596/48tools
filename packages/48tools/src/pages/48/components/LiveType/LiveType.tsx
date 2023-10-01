import { Fragment, type ReactElement } from 'react';
import { Tag } from 'antd';
import type { LiveInfo } from '@48tools-api/48';

export function liveTypeRender(liveType: LiveInfo['liveType'] | number): ReactElement {
  switch (liveType) {
    case 5:
      return <Tag color="magenta">游戏</Tag>;

    case 2:
      return <Tag color="volcano">电台</Tag>;

    default:
      return <Tag color="purple">视频</Tag>;
  }
}

interface LiveTypeProps {
  liveInfo: LiveInfo;
}

/* 直播类型 */
function LiveType(props: LiveTypeProps): ReactElement {
  const { liveInfo }: LiveTypeProps = props;
  const { liveType, liveMode, inMicrophoneConnection }: LiveInfo = liveInfo;

  if (liveMode === 1) {
    return <Tag color="blue">录屏</Tag>;
  }

  return (
    <Fragment>
      { liveTypeRender(liveType) }
      { inMicrophoneConnection ? <Tag className="m-0" color="cyan">连麦</Tag> : null }
    </Fragment>
  );
}

export default LiveType;