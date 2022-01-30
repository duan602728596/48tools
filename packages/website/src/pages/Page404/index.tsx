import { Fragment, type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ErrorBlock, Button } from 'antd-mobile';
import classNames from 'classnames';
import style from './index.module.sass';
import xiaoyuanAvif from './images/xiaoyuan.avif';
import xiaoyuanWebp from './images/xiaoyuan.webp';
import xiaoyuanJpg from './images/xiaoyuan.jpg';

/* 404页 */
function Index(props: {}): ReactElement {
  return (
    <Fragment>
      <Helmet>
        <title>没有找到你需要的东西 - 48tools</title>
      </Helmet>
      <div className="flex h-full">
        <div className={ classNames('grow py-[32px] overflow-auto', style.errorBlockPicture) }>
          <ErrorBlock status="empty" image={
            <div className="max-w-[375px] w-full mx-auto">
              <picture className="block w-full">
                <source srcSet={ xiaoyuanAvif } type="image/avif" />
                <source srcSet={ xiaoyuanWebp } type="image/avif" />
                <img className="block w-full" src={ xiaoyuanJpg } />
              </picture>
            </div>
          } />
          <Link className={ classNames('block mt-[16px] mx-[16px]', style.noUnderline) } to="/">
            <Button color="warning" block={ true }>返回</Button>
          </Link>
        </div>
      </div>
    </Fragment>
  );
}

export default Index;