import type { ReactElement } from 'react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale-provider/zh_CN';

/* App */
function App(props: {}): ReactElement {
  return (
    <ConfigProvider locale={ zhCN }>
      <div></div>
    </ConfigProvider>
  );
}

export default App;