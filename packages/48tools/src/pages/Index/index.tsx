import { ipcRenderer, shell } from 'electron';
import { useContext, type ReactElement, type ReactNode, type MouseEvent } from 'react';
import { Button, Divider, Space, Image, Tooltip } from 'antd';
import Icon, {
  ToolTwoTone as IconToolTwoTone,
  BugTwoTone as IconBugTwoTone,
  WeiboOutlined as IconWeiboOutlined,
  MessageFilled as IconMessageFilled
} from '@ant-design/icons';
import * as classNames from 'classnames';
import style from './index.sass';
import ButtonLink from '../../components/ButtonLink/ButtonLink';
import FFmpegOption from './FFmpegOption/FFmpegOption';
import ExecutablePath from './ExecutablePath/ExecutablePath';
import ThemeContext, { type Theme } from '../../components/Theme/ThemeContext';
import License from './License/License';
import IconLiveSvgComponent from './images/live.component.svg';
import IconVideoSvgComponent from './images/video.component.svg';
import IconMicrophoneSvgComponent from './images/microphone.component.svg';
import IconRecordSvgComponent from './images/record.component.svg';
import IconBilibiliLogoSvgComponent from './images/bilibililogo.component.svg';
import IconAcFunLogoSvgComponent from './images/acfunlogo.component.svg';
import IconDouyinSvgComponent from './images/douyin.component.svg';
import IconCutSvgComponent from './images/cut.component.svg';
import IconConcatSvgComponent from './images/concat.component.svg';
import IconPowerShellSvgComponent from './images/powershell.component.svg';
import imageUrlZfbAvif from './images/zfb.avif';
import imageUrlWxAvif from './images/wx.avif';

interface NativeItem {
  name: string;
  url: string;
  icon: ReactElement;
  hBtn?: boolean;
  testId?: string;
}

const IconBilibiliLogo: ReactElement
    = <Icon className={ classNames('relative', style.iconBilibili) } component={ IconBilibiliLogoSvgComponent } />,
  IconAcFunLogo: ReactElement
    = <Icon className={ classNames('relative', style.iconAcFun) } component={ IconAcFunLogoSvgComponent } />;

/* 导航配置 */
const navLinkConfig: Array<Array<NativeItem>> = [
  [
    {
      name: '口袋48直播抓取',
      url: '/48/Pocket48Live',
      icon: <Icon className={ classNames('text-[18px]', style.iconV5) } component={ IconLiveSvgComponent } />
    },
    {
      name: '口袋48录播下载',
      url: '/48/Pocket48Record',
      icon: <Icon className={ classNames('text-[18px]', style.iconV4) } component={ IconVideoSvgComponent } />,
      testId: 'pocket48-record-link'
    },
    {
      name: '官方公演直播抓取',
      url: '/48/InLive',
      icon: <Icon className={ classNames('text-[18px]', style.iconV4) } component={ IconMicrophoneSvgComponent } />
    },
    {
      name: '官方公演录播下载',
      url: '/48/InVideo',
      icon: <Icon className={ classNames('text-[18px]', style.iconV4) } component={ IconRecordSvgComponent } />,
      testId: '48-in-video-link'
    }
  ],
  [
    {
      name: 'B站视频下载',
      url: '/Bilibili/Download',
      icon: IconBilibiliLogo,
      hBtn: true,
      testId: 'bilibili-download-link'
    },
    {
      name: 'B站直播抓取',
      url: '/Bilibili/Live',
      icon: IconBilibiliLogo,
      hBtn: true,
      testId: 'bilibili-live-link'
    },
    {
      name: 'A站视频下载',
      url: '/AcFun/Download',
      icon: IconAcFunLogo,
      hBtn: true,
      testId: 'acfun-download-link'
    },
    {
      name: 'A站直播抓取',
      url: '/AcFun/Live',
      icon: IconAcFunLogo,
      hBtn: true,
      testId: 'acfun-live-link'
    }
  ],
  [
    {
      name: '抖音视频下载',
      url: '/Toutiao/Douyin',
      icon: <Icon className={ classNames('text-[18px]', style.iconV4) } component={ IconDouyinSvgComponent } />
    },
    {
      name: '微博超话签到',
      url: '/WeiboSuper',
      icon: <IconWeiboOutlined />
    },
    {
      name: '口袋房间消息',
      url: '/48/RoomMessage',
      icon: <IconMessageFilled />
    }
  ],
  [
    {
      name: '视频裁剪',
      url: '/VideoEdit/VideoCut',
      icon: <Icon className={ classNames('text-[18px]', style.iconV4) } component={ IconCutSvgComponent } />
    },
    {
      name: '视频合并',
      url: '/VideoEdit/Concat',
      icon: <Icon className={ classNames('text-[18px]', style.iconV4) } component={ IconConcatSvgComponent } />
    },
    {
      name: '执行FFmpeg命令',
      url: '/VideoEdit/FFmpegProcess',
      icon: <Icon className={ classNames('text-[18px]', style.iconV4) } component={ IconPowerShellSvgComponent } />
    }
  ]
];

/* 导航渲染 */
function nativeRender(): Array<ReactNode> {
  const element: Array<ReactElement> = [];

  for (let i: number = 0, j: number = navLinkConfig.length; i < j; i++) {
    const group: Array<NativeItem> = navLinkConfig[i];
    const groupElement: Array<ReactElement> = [];

    for (const navItem of group) {
      groupElement.push(
        <ButtonLink key={ navItem.name }
          linkProps={{ to: navItem.url }}
          buttonProps={{
            className: navItem.hBtn ? 'overflow-hidden' : undefined,
            icon: navItem.icon,
            'data-test-id': navItem.testId
          }}
        >
          { navItem.name }
        </ButtonLink>
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

// 打开issues
function handleOpenIssuesClick(event: MouseEvent): void {
  shell.openExternal('https://github.com/duan602728596/48tools/issues');
}

// 打开开发者工具
function handleOpenDeveloperToolsClick(event: MouseEvent): void {
  ipcRenderer.send('developer-tools');
}

// 打开软件下载地址
function handleOpenDownloadUrlClick(event: MouseEvent): void {
  shell.openExternal('https://github.com/duan602728596/48tools/releases');
}

/* 首页 */
function Index(props: {}): ReactElement {
  const theme: Theme = useContext(ThemeContext);

  return (
    <div className="p-[16px]">
      { nativeRender() }
      <div>
        <Space size={ 8 }>
          <FFmpegOption />
          <ExecutablePath />
          { theme.ChangeThemeElement }
          <Tooltip title="开发者工具">
            <Button type="text" icon={ <IconToolTwoTone /> } onClick={ handleOpenDeveloperToolsClick } />
          </Tooltip>
          <Tooltip title="问题反馈">
            <Button type="text" icon={ <IconBugTwoTone /> } onClick={ handleOpenIssuesClick } />
          </Tooltip>
          <License />
        </Space>
      </div>
      <Divider />
      <div className="flex">
        <div>
          {/* 二维码 */}
          <p>欢迎打赏：</p>
          <Space size={ 8 }>
            <Image className={ classNames('cursor-pointer', style.dashangImage) } src={ imageUrlZfbAvif } />
            <Image className={ classNames('cursor-pointer', style.dashangImage) } src={ imageUrlWxAvif } />
          </Space>
        </div>
        <div className="ml-[32px]">
          <p>软件最新版本下载地址：</p>
          <Button type="link" onClick={ handleOpenDownloadUrlClick }>
            https://github.com/duan602728596/48tools/releases
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Index;