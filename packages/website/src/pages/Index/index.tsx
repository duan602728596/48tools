import { Fragment, type ReactElement } from 'react';
import { Helmet } from 'react-helmet';
import Main from '../../components/Main/Main';
import HomePage from './HomePage';

/* 网站首页 */
function Index(props: {}): ReactElement {
  return (
    <Fragment>
      <Helmet>
        <title>48tools</title>
      </Helmet>
      <Main>
        <HomePage />
      </Main>
    </Fragment>
  );
}

export default Index;