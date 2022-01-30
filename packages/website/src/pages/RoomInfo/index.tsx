import { Fragment, type ReactElement } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/Header/Header';
import Search from './Search';

/* 查询房间信息 */
function Index(props: {}): ReactElement {
  return (
    <Fragment>
      <Helmet>
        <title>信息查询 - 48tools</title>
      </Helmet>
      <div className="flex flex-col h-full">
        <div className="shrink-0">
          <Header title="信息查询" />
        </div>
        <Search />
      </div>
    </Fragment>
  );
}

export default Index;