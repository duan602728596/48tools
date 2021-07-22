import { Fragment, ReactElement } from 'react';
import Header from '../../../components/Header/Header';
import Add from './Add';

/* 抖音视频下载 */
function Douyin(props: {}): ReactElement {
  return (
    <Fragment>
      <Header>
        <Add />
      </Header>
    </Fragment>
  );
}

export default Douyin;