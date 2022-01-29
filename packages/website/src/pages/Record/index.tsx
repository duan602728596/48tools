import { Fragment, type ReactElement } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/Header/Header';
import Download from './Download';

/* 录播地址导出 */
function Index(props: {}): ReactElement {
  return (
    <Fragment>
      <Helmet>
        <title>录播地址导出 - 48tools</title>
      </Helmet>
      <div className="h-full">
        <Header title="录播地址导出" />
        <Download />
      </div>
    </Fragment>
  );
}

export default Index;