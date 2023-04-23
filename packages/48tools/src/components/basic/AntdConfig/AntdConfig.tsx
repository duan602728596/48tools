import { useContext, type ReactElement, type PropsWithChildren } from 'react';
import * as PropTypes from 'prop-types';
import { ConfigProvider } from 'antd';
import darkDerivative from 'antd/es/theme/themes/dark/index';
import zhCN from 'antd/locale/zh_CN';
import { cyan } from '@ant-design/colors';
import ThemeContext, { type Theme } from '../Theme/ThemeContext';

/* antd ConfigProvider */
function AntdConfig(props: Required<PropsWithChildren>): ReactElement {
  const { isDark }: Theme = useContext(ThemeContext);

  return (
    <ConfigProvider locale={ zhCN }
      theme={{
        token: {
          colorPrimary: cyan.primary
        },
        algorithm: isDark ? darkDerivative : undefined
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