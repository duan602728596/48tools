import { Fragment, ReactElement } from 'react';
import Header from '../../../components/Header/Header';
import AddForm from './AddForm';

/* A站视频下载 */
function Download(props: {}): ReactElement {
  return (
    <Fragment>
      <Header>
        <AddForm />
      </Header>
    </Fragment>
  );
}

export default Download;