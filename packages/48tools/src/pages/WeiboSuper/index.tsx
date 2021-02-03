import type { ReactElement } from 'react';
import Content from '../../components/Content/Content';
import Header from '../../components/Header/Header';
import WeiboLogin from '../../components/WeiboLogin/WeiboLogin';

/* 微博超话签到 */
function Index(props: {}): ReactElement {
  return (
    <Content>
      <Header>
        <WeiboLogin />
      </Header>
    </Content>
  );
}

export default Index;