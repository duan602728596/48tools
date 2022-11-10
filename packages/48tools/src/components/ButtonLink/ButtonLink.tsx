import type { ReactElement, MouseEvent } from 'react';
import { useHref, useLinkClickHandler, type LinkProps } from 'react-router-dom';
import { Button, type ButtonProps } from 'antd';
import { pick } from '../../utils/lodash';

export interface ButtonLinkProps {
  linkProps: LinkProps;
  buttonProps: ButtonProps;
}

/* 使用antd的button实现react-router的<Link />组件 */
function ButtonLink(props: ButtonLinkProps): ReactElement {
  const { linkProps, buttonProps }: ButtonLinkProps = props;
  const href: string = useHref(linkProps.to);
  const handleButtonClick: (event: MouseEvent) => void
    = useLinkClickHandler(linkProps.to, pick(linkProps, ['replace', 'state', 'target']));

  return <Button href={ href } onClick={ handleButtonClick } { ...buttonProps } />;
}

export default ButtonLink;