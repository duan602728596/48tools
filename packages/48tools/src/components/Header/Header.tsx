import type { ReactElement, ReactNode } from 'react';
import * as PropTypes from 'prop-types';
import ButtonLink from '../ButtonLink/ButtonLink';

interface HeaderProps {
  to?: string;
  children?: ReactNode;
}

/**
 * 通用头部样式
 * @param { string } props.to: 返回的跳转地址
 * @param { ReactNode } props.children: 网站右侧组件
 */
function Header(props: HeaderProps): ReactElement {
  const { to = '/', children }: HeaderProps = props;

  return (
    <header className="flex mb-[8px]">
      <div className="grow">
        <ButtonLink linkProps={{ to }} buttonProps={{ type: 'primary', danger: true }}>返回</ButtonLink>
      </div>
      <div>{ children }</div>
    </header>
  );
}

Header.propTypes = {
  to: PropTypes.string,
  children: PropTypes.node
};

export default Header;