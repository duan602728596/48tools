import type { ReactElement } from 'react';
import Header from '../../components/Header/Header';
import License from './License';
import Software from './Software/Software';

/* License and open source software */
function Credits(props: {}): ReactElement {
  return (
    <div className="p-[16px]">
      <Header to="/" />
      <License />
      <Software />
    </div>
  );
}

export default Credits;