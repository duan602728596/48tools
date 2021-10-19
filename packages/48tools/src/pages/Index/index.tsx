import { ipcRenderer, shell } from 'electron';
import { useContext, ReactElement, ReactNodeArray, MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button, Divider, Space, Image, Tooltip } from 'antd';
import Icon, {
  ToolTwoTone as IconToolTwoTone,
  BugTwoTone as IconBugTwoTone,
  WeiboOutlined as IconWeiboOutlined
} from '@ant-design/icons';
import classNames from 'classnames';
import style from './index.sass';
import FFmpegOption from './FFmpegOption';
import ExecutablePath from './ExecutablePath';
import ThemeContext, { Theme } from '../../components/Theme/ThemeContext';
import IconLiveSvgComponent from './images/live.component.svg';
import IconVideoSvgComponent from './images/video.component.svg';
import IconMicrophoneSvgComponent from './images/microphone.component.svg';
import IconRecordSvgComponent from './images/record.component.svg';
import IconBilibiliLogoSvgComponent from './images/bilibililogo.component.svg';
import IconAcFunLogoSvgComponent from './images/acfunlogo.component.svg';
import IconDouyinSvgComponent from './images/douyin.component.svg';
import IconCutSvgComponent from './images/cut.component.svg';
import IconConcatSvgComponent from './images/concat.component.svg';
import IconCountSvgComponent from './images/count.component.svg';

interface NativeItem {
  name: string;
  url: string;
  icon: ReactElement;
  hBtn?: boolean;
}

const IconBilibiliLogo: ReactElement = <Icon className={ style.iconBilibili } component={ IconBilibiliLogoSvgComponent } />,
  IconAcFunLogo: ReactElement = <Icon className={ style.iconAcFun } component={ IconAcFunLogoSvgComponent } />;

/* 导航配置 */
const navLinkConfig: Array<Array<NativeItem>> = [
  [
    {
      name: '口袋48直播抓取',
      url: '/48/Pocket48Live',
      icon: <Icon className={ classNames(style.icon, style.iconV5) } component={ IconLiveSvgComponent } />
    },
    {
      name: '口袋48录播下载',
      url: '/48/Pocket48Record',
      icon: <Icon className={ classNames(style.icon, style.iconV4) } component={ IconVideoSvgComponent } />
    },
    {
      name: '官方公演直播抓取',
      url: '/48/InLive',
      icon: <Icon className={ classNames(style.icon, style.iconV4) } component={ IconMicrophoneSvgComponent } />
    },
    {
      name: '官方公演录播下载',
      url: '/48/InVideo',
      icon: <Icon className={ classNames(style.icon, style.iconV4) } component={ IconRecordSvgComponent } />
    }
  ],
  [
    { name: 'B站视频下载', url: '/Bilibili/Download', icon: IconBilibiliLogo, hBtn: true },
    { name: 'B站直播抓取', url: '/Bilibili/Live', icon: IconBilibiliLogo, hBtn: true },
    { name: 'A站视频下载', url: '/AcFun/Download', icon: IconAcFunLogo, hBtn: true },
    { name: 'A站直播抓取', url: '/AcFun/Live', icon: IconAcFunLogo, hBtn: true }
  ],
  [
    {
      name: '抖音视频下载',
      url: '/Toutiao/Douyin',
      icon: <Icon className={ classNames(style.icon, style.iconV4) } component={ IconDouyinSvgComponent } />
    },
    {
      name: '微博超话签到',
      url: '/WeiboSuper',
      icon: <IconWeiboOutlined />
    }
  ],
  [
    {
      name: '视频裁剪',
      url: '/VideoEdit/VideoCut',
      icon: <Icon className={ classNames(style.icon, style.iconV4) } component={ IconCutSvgComponent } />
    },
    {
      name: '视频合并',
      url: '/VideoEdit/Concat',
      icon: <Icon className={ classNames(style.icon, style.iconV4) } component={ IconConcatSvgComponent } />
    },
    {
      name: '桃叭加密解密',
      url: '/TaobaEncrypt',
      icon: <Icon className={ classNames(style.icon, style.iconV4) } component={ IconCountSvgComponent } />
    }
  ]
];

/* 导航渲染 */
function nativeRender(): ReactNodeArray {
  const element: Array<ReactElement> = [];

  for (let i: number = 0, j: number = navLinkConfig.length; i < j; i++) {
    const group: Array<NativeItem> = navLinkConfig[i];
    const groupElement: Array<ReactElement> = [];

    for (const navItem of group) {
      groupElement.push(
        <Link key={ navItem.name } className={ style.navItemLink } to={ navItem.url }>
          <Button className={ navItem.hBtn ? style.hBtn : undefined } icon={ navItem.icon }>{ navItem.name }</Button>
        </Link>
      );
    }

    element.push(
      <nav key={ `nav-${ i }` }>
        <Space size={ 16 }>{ groupElement }</Space>
      </nav>,
      <Divider key={ `divider-${ i }` } />
    );
  }

  return element;
}

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
      { nativeRender() }
      <div>
        <Space size={ 16 }>
          <FFmpegOption />
          <ExecutablePath />
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
      <Space size={ 8 }>
        <Image className={ style.dashangImage } src={ require('./images/zfb.avif') } />
        <Image className={ style.dashangImage } src={ require('./images/wx.avif') } />
      </Space>
    </div>
  );
}

export default Index;