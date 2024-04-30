import type { ReactElement, PropsWithChildren } from 'react';
import * as classNames from 'classnames';
import ButtonLink from '../ButtonLink/ButtonLink';

interface HeaderProps extends PropsWithChildren {
  to?: string;
  className?: string;
}

/**
 * 通用头部样式
 * @param { string } props.to - 返回的跳转地址
 * @param { ReactNode } props.children - 网站右侧组件
 */
function Header(props: HeaderProps): ReactElement {
  const { to = '/', children, className }: HeaderProps = props;

  return (
    <header className={ classNames('flex mb-[8px]', className) }>
      <div className="grow">
        <ButtonLink linkProps={{ to }} buttonProps={{ type: 'primary', danger: true }}>返回</ButtonLink>
      </div>
      <div>{ children }</div>
    </header>
  );
}

export default Header;