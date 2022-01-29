import type { ReactElement, ReactNode } from 'react';
import * as PropTypes from 'prop-types';

/* 网站750宽度限制 */
function Main(props: { children: ReactNode }): ReactElement {
  return <div className="mx-auto my-0 w-[750px] max-w-full h-full bg-white">{ props.children }</div>;
}

Main.propTypes = {
  children: PropTypes.node
};

export default Main;