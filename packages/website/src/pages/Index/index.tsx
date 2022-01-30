import { Fragment, type ReactElement, type MouseEvent } from 'react';
import { useNavigate, type NavigateFunction } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { List } from 'antd-mobile';
import { SearchOutline as IconSearchOutline, VideoOutline as IconVideoOutline } from 'antd-mobile-icons';
import bg1Avif from './images/bg1.avif';
import bg1Webp from './images/bg1.webp';
import bg1Jpg from './images/bg1.jpg';

/* 网站首页 */
function Index(props: {}): ReactElement {
  const navigate: NavigateFunction = useNavigate();

  // 点击跳转到新的地址
  function handleGoToClick(href: string, event: MouseEvent): void {
    navigate(href);
  }

  return (
    <Fragment>
      <Helmet>
        <title>48tools</title>
      </Helmet>
      <div className="pb-[20px]">
        <picture className="block w-full">
          <source srcSet={ bg1Avif } type="image/avif" />
          <source srcSet={ bg1Webp } type="image/avif" />
          <img className="block w-full" src={ bg1Jpg } />
        </picture>
        <List>
          <List.Item prefix={ <IconSearchOutline /> }
            arrow={ true }
            onClick={ (event: MouseEvent): void => handleGoToClick('/RoomInfo', event) }
          >
            信息查询
          </List.Item>
          <List.Item prefix={ <IconVideoOutline /> }
            arrow={ true }
            onClick={ (event: MouseEvent): void => handleGoToClick('/Record', event) }
          >
            录播地址导出
          </List.Item>
        </List>
      </div>
    </Fragment>
  );
}

export default Index;