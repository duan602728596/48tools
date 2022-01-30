import { useCallback, type ReactElement } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, type NavigateFunction } from 'react-router-dom';
import { NavBar } from 'antd-mobile';

/* 网站导航 */
function Header(props: { title: string }): ReactElement {
  const navigate: NavigateFunction = useNavigate();

  // 点击返回首页
  const handleGoHomeClick: () => void = useCallback(function(): void {
    navigate('/');
  }, []);

  return <NavBar back="返回" onBack={ handleGoHomeClick }>{ props.title }</NavBar>;
}

Header.propTypes = {
  title: PropTypes.string
};

export default Header;