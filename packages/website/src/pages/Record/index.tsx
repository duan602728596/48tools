import { Fragment, type ReactElement } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/Header/Header';
import Main from '../../components/Main/Main';
import Download from './Download';

/* 录播地址导出 */
function Index(props: {}): ReactElement {
  return (
    <Fragment>
      <Helmet>
        <title>录播地址导出 - 48tools</title>
      </Helmet>
      <Main>
        <div className="flex flex-col h-full">
          <div className="shrink-0">
            <Header title="录播地址导出" />
          </div>
          <Download />
        </div>
      </Main>
    </Fragment>
  );
}

export default Index;