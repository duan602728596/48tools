import { Fragment, type ReactElement } from 'react';
import Header from '../../../components/Header/Header';
import Search from './Search/Search';

/* 快手视频下载 */
function VideoDownload(props: {}): ReactElement {
  return (
    <Fragment>
      <Header>
        <Search />
      </Header>
    </Fragment>
  );
}

export default VideoDownload;