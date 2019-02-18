/**
 * 异步加载时显示loading
 *
 * @flow
 */
import * as React from 'react';
import { Spin } from 'antd';
import style from './style.sass';

function SwitchLoading(props: Object): React.Node {
  return (
    <div className={ style.loading }>
      <Spin size="large" tip="Loading..." />
    </div>
  );
}

export default SwitchLoading;