import { ipcRenderer, shell } from 'electron';
import { useContext, ReactElement, MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button, Divider, Space, Image, Tooltip } from 'antd';
import { ToolTwoTone as IconToolTwoTone, BugTwoTone as IconBugTwoTone } from '@ant-design/icons';
import style from './index.sass';
import FFmpegOption from './FFmpegOption';
import ThemeContext, { Theme } from '../../components/Theme/ThemeContext';

/* 首页 */
function Index(props: {}): ReactElement {
  const theme: Theme = useContext(ThemeContext);

  // 打开issues
  function handleOpenIssuesClick(event: MouseEvent<HTMLButtonElement>): void {
    shell.openExternal('https://github.com/duan602728596/48tools/issues');
  }

  // 打开开发者工具
  function handleOpenDeveloperToolsClick(event: MouseEvent<HTMLButtonElement>): void {
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
        </Space>
      </nav>
      <Divider />
      <nav>
        <Space size={ 16 }>
          <Link className={ style.navItemLink } to="/VideoEdit/VideoCut">
            <Button>视频裁剪</Button>
          </Link>
          <Link className={ style.navItemLink } to="/VideoEdit/Concat">
            <Button>视频合并</Button>
          </Link>
        </Space>
      </nav>
      <Divider />
      <div>
        <Space size={ 16 }>
          <FFmpegOption />
          { theme.ChangeThemeElement }
          <Tooltip title="开发者工具">
            <Button type="text" icon={ <IconToolTwoTone /> } onClick={ handleOpenDeveloperToolsClick } />
          </Tooltip>
          <Tooltip title="问题反馈">
            <Button type="text" icon={ <IconBugTwoTone /> } onClick={ handleOpenIssuesClick } />
          </Tooltip>
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