import { ipcRenderer, shell } from 'electron';
import { Fragment, useContext, type ReactElement, type ReactNode, type MouseEvent } from 'react';
import { Button, Divider, Space, Image, Tooltip } from 'antd';
import Icon, {
  ToolTwoTone as IconToolTwoTone,
  BugTwoTone as IconBugTwoTone,
  WeiboOutlined as IconWeiboOutlined,
  MessageFilled as IconMessageFilled,
  FileSyncOutlined as IconFileSyncOutlined
} from '@ant-design/icons';
import * as classNames from 'classnames';
import { WinIpcChannel } from '@48tools/main/src/channelEnum';
import style from './index.sass';
import commonStyle from '../../common.sass';
import ButtonLink from '../../components/ButtonLink/ButtonLink';
import FFmpegOption from './FFmpegOption/FFmpegOption';
import ExecutablePath from './ExecutablePath/ExecutablePath';
import NewUserTour from './NewUserTour/NewUserTour';
import ThemeContext, { type Theme } from '../../components/basic/Theme/ThemeContext';
import { useAppDataDir, type UseAppDataDirReturnType } from '../../functionalComponents/Pocket48Login/useAppDataDir/useAppDataDir';
import IconLiveSvgComponent from './images/live.component.svg';
import IconVideoSvgComponent from './images/video.component.svg';
import IconMicrophoneSvgComponent from './images/microphone.component.svg';
import IconRecordSvgComponent from './images/record.component.svg';
import IconBilibiliLogoSvgComponent from './images/bilibililogo.component.svg';
import IconAcFunLogoSvgComponent from './images/acfunlogo.component.svg';
import IconDouyinSvgComponent from './images/douyin.component.svg';
import IconKuaishouSvgComponent from './images/kuaishou.component.svg';
import IconCutSvgComponent from './images/cut.component.svg';
import IconConcatSvgComponent from './images/concat.component.svg';
import IconPowerShellSvgComponent from './images/powershell.component.svg';
import IconDiantaiSvgComponent from './images/diantai.component.svg';
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
    = <Icon className={ classNames('relative', style.iconAcFun) } component={ IconAcFunLogoSvgComponent } />,
  IconDouyinLogo: ReactElement
    = <Icon className={ classNames('text-[18px]', style.iconV4) } component={ IconDouyinSvgComponent } />,
  IconKuaishouLogo: ReactElement
    = <Icon className={ classNames('text-[18px]', style.iconV4) } component={ IconKuaishouSvgComponent } />;

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
      name: '口袋房间电台',
      url: '/48/Voice',
      icon: <Icon className={ classNames('text-[18px]', style.iconV4) } component={ IconDiantaiSvgComponent } />
    },
    {
      name: '口袋房间消息',
      url: '/48/RoomMessage',
      icon: <IconMessageFilled />
    },
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
    }
  ],
  [
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
    },
    {
      name: '抖音视频下载',
      url: '/Toutiao/Douyin',
      icon: IconDouyinLogo,
      testId: 'douyin-download-link'
    },
    {
      name: '抖音直播抓取',
      url: '/Toutiao/DouyinLive',
      icon: IconDouyinLogo,
      testId: 'douyin-live-link'
    }
  ],
  [
    {
      name: '快手视频下载',
      url: '/Kuaishou/VideoDownload',
      icon: IconKuaishouLogo
    },
    {
      name: '快手直播抓取',
      url: '/Kuaishou/Live',
      icon: IconKuaishouLogo
    },
    {
      name: '微博直播录制',
      url: '/WeiboLive',
      icon: <IconWeiboOutlined />,
      testId: 'weibo-live-link'
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
        <div key={ navItem.name }>
          <ButtonLink linkProps={{ to: navItem.url }}
            buttonProps={{
              className: navItem.hBtn ? 'overflow-hidden' : undefined,
              icon: navItem.icon,
              block: true,
              'data-test-id': navItem.testId
            }}
          >
            { navItem.name }
          </ButtonLink>
        </div>
      );
    }

    element.push(
      <nav key={ `nav-${ i }` } className="grid grid-cols-4 gap-[16px] w-[755px]">
        { groupElement }
      </nav>,
      <Divider key={ `driver-${ i }` } className="my-[16px]" />
    );
  }

  return element;
}

// 打开使用说明
function handleOpenHelpClick(event: MouseEvent): void {
  shell.openExternal('https://yzb1g5r02h.feishu.cn/docx/MxfydWlNaovZ5sxsbJ5crnAlnVb');
}

// 打开issues
function handleOpenIssuesClick(event: MouseEvent): void {
  shell.openExternal('https://github.com/duan602728596/48tools/issues');
}

// 打开开发者工具
function handleOpenDeveloperToolsClick(event: MouseEvent): void {
  ipcRenderer.send(WinIpcChannel.DeveloperTools);
}

// 打开软件下载地址
function handleOpenDownloadUrlClick(event: MouseEvent): void {
  shell.openExternal('https://github.com/duan602728596/48tools/releases');
}

/* 首页 */
function Index(props: {}): ReactElement {
  const theme: Theme = useContext(ThemeContext);
  const { buttonRender, modalRender }: UseAppDataDirReturnType = useAppDataDir();

  return (
    <Fragment>
      <div className="p-[16px]">
        { nativeRender() }
        <div className="mb-[8px]">
          <Space>
            <FFmpegOption />
            { buttonRender() }
            <ExecutablePath />
          </Space>
        </div>
        <div className="text-right">
          <Space>
            <Button id="help-doc" icon={ <IconFileSyncOutlined /> } onClick={ handleOpenHelpClick }>使用手册</Button>
            { theme.ChangeThemeElement }
            <Tooltip title="开发者工具">
              <Button type="text" icon={ <IconToolTwoTone /> } onClick={ handleOpenDeveloperToolsClick } />
            </Tooltip>
            <Tooltip title="问题反馈">
              <Button id="issues" type="text" icon={ <IconBugTwoTone /> } onClick={ handleOpenIssuesClick } />
            </Tooltip>
            <ButtonLink linkProps={{ to: '/Agreement/Agreement' }} buttonProps={{ type: 'text' }}>License</ButtonLink>
          </Space>
        </div>
        <Divider className="my-[16px]" />
        <div className={ commonStyle.text }>
          <p>
            本软件为免费软件，
            <b>使用及传播均不收取任何费用</b>
            。为了避免您的财产损失，请在
            <Button type="link" onClick={ handleOpenDownloadUrlClick }>
              https://github.com/duan602728596/48tools/releases
            </Button>
            下载软件的最新版本。如果你想要赞助作者，请扫码打赏。
          </p>
          <Space size={ 8 }>
            <Image className={ classNames('cursor-pointer', style.dashangImage) } src={ imageUrlZfbAvif } />
            <Image className={ classNames('cursor-pointer', style.dashangImage) } src={ imageUrlWxAvif } />
          </Space>
        </div>
      </div>
      { modalRender() }
      { globalThis.__INITIAL_STATE__.isTest ? null : <NewUserTour /> }
    </Fragment>
  );
}

export default Index;