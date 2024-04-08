import type { ReactElement } from 'react';
import Content from '../../../components/Content/Content';
import Header from '../../../components/Header/Header';
import AddLiveUrlForm from './AddLiveUrlForm/AddLiveUrlForm';

/* 微博直播 */
function WeiboLive(props: {}): ReactElement {
  return (
    <Content>
      <Header>
        <AddLiveUrlForm />
      </Header>
    </Content>
  );
}

export default WeiboLive;