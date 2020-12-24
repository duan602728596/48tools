import { ReactElement } from 'react';
import { HashRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale-provider/zh_CN';
import Routers from './router/Routers';

/* PlayerApp */
function App(props: {}): ReactElement {
  return (
    <ConfigProvider locale={ zhCN }>
      <HashRouter>
        <Routers />
      </HashRouter>
    </ConfigProvider>
  );
}

export default App;