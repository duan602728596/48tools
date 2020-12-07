import { Fragment, ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'antd';
import style from '../../48/index.sass';

/* 视频下载 */
function Download(props: {}): ReactElement {
  return (
    <Fragment>
      <header className={ style.header }>
        <div className={ style.headerLeft }>
          <Link to="/">
            <Button type="primary" danger={ true }>返回</Button>
          </Link>
        </div>
      </header>
    </Fragment>
  );
}

export default Download;