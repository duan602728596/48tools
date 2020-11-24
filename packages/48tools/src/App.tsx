import { useEffect, ReactElement } from 'react';
import { HashRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale-provider/zh_CN';
import { storeFactory } from './store/store';
import Routers from './router/Routers';
import dbInit from './function/dbInit/dbInit';

/* App */
function App(props: {}): ReactElement {
  useEffect(function(): void {
    dbInit();
  }, []);

  return (
    <Provider store={ storeFactory() }>
      <ConfigProvider locale={ zhCN }>
        <HashRouter>
          <Routers />
        </HashRouter>
      </ConfigProvider>
    </Provider>
  );
}

export default App;