import type { ReactElement, ReactNode } from 'react';
import * as PropTypes from 'prop-types';
import * as classNames from 'classnames';

interface ContentProps {
  className?: string;
  children: ReactNode;
}

/**
 * 通用的布局组件
 * @param { string | undefined } props.className: 类
 * @param { ReactNode } props.children: 子元素
 */
function Content(props: ContentProps): ReactElement {
  const { className, children }: ContentProps = props;

  return <div className={ classNames('p-[16px]', className) }>{ children }</div>;
}

Content.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node
};

export default Content;