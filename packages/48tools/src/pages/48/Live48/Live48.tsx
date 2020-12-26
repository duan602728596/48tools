import { Fragment, ReactElement } from 'react';
import Header from '../../../components/Header/Header';
import GetLiveUrl from './GetLiveUrl';

/* 官网公演直播抓取 */
function Live48(props: {}): ReactElement {
  return (
    <Fragment>
      <Header>
        <GetLiveUrl />
      </Header>
    </Fragment>
  );
}

export default Live48;