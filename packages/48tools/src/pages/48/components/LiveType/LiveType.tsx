import { Fragment, type ReactElement } from 'react';
import { Tag } from 'antd';
import { Pocket48LiveType, Pocket48LiveMode } from '@48tools-api/48/enum';
import type { LiveInfo } from '@48tools-api/48';

export function liveTypeRender(liveType: Pocket48LiveType): ReactElement {
  switch (liveType) {
    case Pocket48LiveType.Game:
      return <Tag color="magenta">游戏</Tag>;

    case Pocket48LiveType.Radio:
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

  if (liveMode === Pocket48LiveMode.Record) {
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