import type { ReactElement, PropsWithChildren } from 'react';
import classNames from 'classnames';
import style from './main.module.sass';

/* 网站750宽度限制 */
function Main(props: PropsWithChildren): ReactElement {
  return (
    <div className={ classNames('mx-auto my-0 w-[750px] max-w-full h-full bg-white', style.touchOverflow) }>
      { props.children }
    </div>
  );
}

export default Main;