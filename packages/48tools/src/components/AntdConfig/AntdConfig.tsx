import type { ReactNode, ReactElement } from 'react';
import * as PropTypes from 'prop-types';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { cyan } from '@ant-design/colors';

/* antd ConfigProvider */
function AntdConfig(props: { children: ReactNode }): ReactElement {
  return (
    <ConfigProvider locale={ zhCN }
      theme={{
        token: {
          colorPrimary: cyan.primary
        }
      }}
    >
      { props.children }
    </ConfigProvider>
  );
}

AntdConfig.propTypes = {
  children: PropTypes.node
};

export default AntdConfig;