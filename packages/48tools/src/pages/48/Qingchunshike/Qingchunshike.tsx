import { Fragment, type ReactElement } from 'react';
import { useLocation, type Location } from 'react-router-dom';
import Header from '../../../components/Header/Header';
import AddForm from './AddForm/AddForm';
import CreateResult from './CeateResult/CreateResult';

function Qingchunshike(props: {}): ReactElement {
  const location: Location = useLocation();
  const fromPathname: string = location?.state?.from ?? '/';

  return (
    <Fragment>
      <Header to={ fromPathname } />
      <AddForm />
      <CreateResult />
    </Fragment>
  );
}

export default Qingchunshike;