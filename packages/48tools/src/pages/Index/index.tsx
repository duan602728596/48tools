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
        <Link className={ style.navItemLink } to="/">
          <Button>直播抓取</Button>
        </Link>
      </nav>
      <Divider />
      <div>
        <FFmpegOption />
        <Button type="text" icon={ <IconToolTwoTone /> } onClick={ handleOpenDeveloperToolsClick } />
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