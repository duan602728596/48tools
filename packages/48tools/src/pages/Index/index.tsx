import { ipcRenderer } from 'electron';
import type { ReactElement, MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button, Divider, Space, Image } from 'antd';
import { ToolTwoTone as IconToolTwoTone } from '@ant-design/icons';
import style from './index.sass';
import FFmpegOption from './FFmpegOption';

/* 首页 */
function Index(props: {}): ReactElement {
  // 打开开发者工具
  function handleOpenDeveloperToolsClick(event: MouseEvent): void {
    ipcRenderer.send('developer-tools');
  }

  return (
    <div className={ style.main }>
      <nav>
        <Space size={ 16 }>
          <Link className={ style.navItemLink } to="/48/Pocket48Live">
            <Button>口袋48直播抓取</Button>
          </Link>
          <Link className={ style.navItemLink } to="/48/Pocket48Record">
            <Button>口袋48录播下载</Button>
          </Link>
          <Link className={ style.navItemLink } to="/48/InLive">
            <Button>官方公演直播抓取</Button>
          </Link>
          <Link className={ style.navItemLink } to="/48/InVideo">
            <Button>官方公演录播下载</Button>
          </Link>
        </Space>
      </nav>
      <Divider />
      <nav>
        <Space size={ 16 }>
          <Link className={ style.navItemLink } to="/Bilibili/Download">
            <Button>B站视频下载</Button>
          </Link>
          <Link className={ style.navItemLink } to="/Bilibili/Live">
            <Button>B站直播抓取</Button>
          </Link>
          <Link className={ style.navItemLink } to="/VideoCut">
            <Button>视频裁剪</Button>
          </Link>
          <Link className={ style.navItemLink } to="/Concat">
            <Button>视频合并</Button>
          </Link>
        </Space>
      </nav>
      <Divider />
      <div>
        <Space size={ 16 }>
          <FFmpegOption />
          <Button type="text" icon={ <IconToolTwoTone /> } onClick={ handleOpenDeveloperToolsClick } />
        </Space>
      </div>
      <Divider />
      {/* 二维码 */}
      <p>欢迎打赏：</p>
      <Space>
        <Image className={ style.dashangImage } src={ require('./images/zfb.avif').default } />
        <Image className={ style.dashangImage } src={ require('./images/wx.avif').default } />
      </Space>
    </div>
  );
}

export default Index;