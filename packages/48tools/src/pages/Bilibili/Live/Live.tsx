import { Fragment, ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'antd';
import style from '../../48/index.sass';
import AddForm from './AddForm';

/* 直播抓取 */
function Live(props: {}): ReactElement {
  return (
    <Fragment>
      <header className={ style.header }>
        <div className={ style.headerLeft }>
          <Link to="/">
            <Button type="primary" danger={ true }>返回</Button>
          </Link>
        </div>
        <div>
          <AddForm />
        </div>
      </header>
    </Fragment>
  );
}

export default Live;