import type { ReactElement, ReactNode } from 'react';
import * as PropTypes from 'prop-types';
import style from './content.sass';

/**
 * 通用的布局组件
 * @param { ReactNode } props.children: 子元素
 */
function Content(props: { children: ReactNode }): ReactElement {
  return <div className={ style.content }>{ props.children }</div>;
}

Content.propTypes = {
  children: PropTypes.node
};

export default Content;