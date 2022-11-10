import type { ReactElement, ReactNode, MouseEvent } from 'react';
import * as PropTypes from 'prop-types';
import { useHref, useLinkClickHandler, type LinkProps } from 'react-router-dom';
import { Button, type ButtonProps } from 'antd';
import { pick } from '../../utils/lodash';

export interface ButtonLinkProps {
  linkProps: LinkProps;
  buttonProps?: ButtonProps & Record<string, unknown>;
  children?: ReactNode;
}

/* 使用antd的button实现react-router的<Link />组件 */
function ButtonLink(props: ButtonLinkProps): ReactElement {
  const { linkProps, buttonProps = {}, children }: ButtonLinkProps = props;
  const href: string = useHref(linkProps.to);
  const handleButtonClick: (event: MouseEvent) => void
    = useLinkClickHandler(linkProps.to, pick(linkProps, ['replace', 'state', 'target']));

  return <Button href={ href } onClick={ handleButtonClick } { ...buttonProps }>{ children }</Button>;
}

ButtonLink.propTypes = {
  linkProps: PropTypes.object,
  buttonProps: PropTypes.object,
  children: PropTypes.node
};

export default ButtonLink;