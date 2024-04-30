import { useContext, type ReactElement, type PropsWithChildren } from 'react';
import { ConfigProvider, App } from 'antd';
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
      <App component={ false }>
        { props.children }
      </App>
    </ConfigProvider>
  );
}

export default AntdConfig;