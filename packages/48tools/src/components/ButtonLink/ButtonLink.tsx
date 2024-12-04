import type { ReactElement, MouseEvent, PropsWithChildren } from 'react';
import { useHref, useLinkClickHandler, type LinkProps } from 'react-router';
import { Button, type ButtonProps } from 'antd';
import { pick } from '../../utils/lodash';

interface ButtonLinkProps extends PropsWithChildren {
  linkProps: LinkProps;
  buttonProps?: Omit<ButtonProps, 'href'> & Record<string, unknown>;
}

/**
 * 使用antd的button实现react-router的<Link />组件
 * @param { LinkProps } props.linkProps - <Link />的props
 * @param { ButtonProps & Record<string, unknown> } [props.buttonProps = {}] - <Button />的props
 * @param { ReactNode } [props.children] - <Button />组件的子元素
 */
function ButtonLink(props: ButtonLinkProps): ReactElement {
  const { linkProps, buttonProps = {}, children }: ButtonLinkProps = props;
  const href: string = useHref(linkProps.to);
  const handleButtonClick: (event: MouseEvent) => void
    = useLinkClickHandler(linkProps.to, pick(linkProps, ['replace', 'state', 'target']));

  return <Button href={ href } onClick={ handleButtonClick } { ...buttonProps }>{ children }</Button>;
}

export default ButtonLink;