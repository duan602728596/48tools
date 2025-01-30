import { ipcRenderer, shell } from 'electron';
import { Fragment, createElement, use, type ReactElement, type ReactNode, type MouseEvent } from 'react';
import { Button, Divider, Space, Image, Tooltip } from 'antd';
import Icon, {
  ToolTwoTone as IconToolTwoTone,
  BugTwoTone as IconBugTwoTone,
  WeiboOutlined as IconWeiboOutlined,
  MessageFilled as IconMessageFilled,
  FileSyncOutlined as IconFileSyncOutlined
} from '@ant-design/icons';
import { WinIpcChannel } from '@48tools/main/src/channelEnum';
import commonStyle from '../../common.sass';
import ButtonLink from '../../components/ButtonLink/ButtonLink';
import FFmpegOption from './FFmpegOption/FFmpegOption';
import ExecutablePath from './ExecutablePath/ExecutablePath';
import NewUserTour from './NewUserTour/NewUserTour';
import ThemeContext, { type Theme } from '../../components/basic/Theme/ThemeContext';
import { useAppDataDir, type UseAppDataDirReturnType } from '../../functionalComponents/Pocket48Login/useAppDataDir/useAppDataDir';
import HelpButtonGroup, { type HelpButtonGroupProps } from '../../components/HelpButtonGroup/HelpButtonGroup';
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
import IconXiaohongshuSvgComponent from './images/xiaohongshu.component.svg';
import imageUrlZfbAvif from './images/zfb.avif';
import imageUrlWxAvif from './images/wx.avif';
import ShowroomTextIcon from './ShowroomTextIcon/ShowroomTextIcon';

interface NativeItem {
  name: string | ReactElement;
  key?: string;
  url: string;
  icon?: ReactElement;
  hBtn?: boolean;
  testId?: string;
  help?: HelpButtonGroupProps;
}

const IconBilibiliLogo: ReactElement
    = <Icon className="text-[32px]" component={ IconBilibiliLogoSvgComponent } />,
  IconAcFunLogo: ReactElement
    = <Icon className="text-[46px]" component={ IconAcFunLogoSvgComponent } />,
  IconDouyinLogo: ReactElement
    = <Icon className="text-[18px]" component={ IconDouyinSvgComponent } />,
  IconKuaishouLogo: ReactElement
    = <Icon className="text-[18px]" component={ IconKuaishouSvgComponent } />;

/* 导航配置 */
const navLinkConfig: Array<Array<NativeItem>> = [
  [
    {
      name: '口袋48直播抓取',
      url: '/48/Pocket48Live',
      icon: <Icon className="text-[18px]" component={ IconLiveSvgComponent } />
    },
    {
      name: '口袋48录播下载',
      url: '/48/Pocket48Record',
      icon: <Icon className="text-[18px]" component={ IconVideoSvgComponent } />,
      testId: 'pocket48-record-link'
    },
    {
      name: '官方公演直播抓取',
      url: '/48/InLive',
      icon: <Icon className="text-[18px]" component={ IconMicrophoneSvgComponent } />
    },
    {
      name: '官方公演录播下载',
      url: '/48/InVideo',
      icon: <Icon className="text-[18px]" component={ IconRecordSvgComponent } />,
      testId: '48-in-video-link'
    }
  ],
  [
    {
      name: '口袋房间电台',
      url: '/48/Voice',
      icon: <Icon className="text-[18px]" component={ IconDiantaiSvgComponent } />
    },
    {
      name: '口袋房间消息',
      url: '/48/RoomMessage',
      icon: <IconMessageFilled />,
      testId: '48-room-message'
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
      icon: IconKuaishouLogo,
      testId: 'kuaishou-download-link'
    },
    {
      name: '快手直播抓取',
      url: '/Kuaishou/Live',
      icon: IconKuaishouLogo
    },
    {
      name: '直播抓取',
      url: '/Xiaohongshu/Live',
      icon: <Icon className="text-[46px]" component={ IconXiaohongshuSvgComponent } />
    },
    {
      name: '微博直播录制',
      url: '/Weibo/Live',
      icon: <IconWeiboOutlined />,
      testId: 'weibo-live-link'
    }
  ],
  [
    {
      name: '微博超话签到',
      url: '/Weibo/Super',
      icon: <IconWeiboOutlined />,
      help: { navId: 'weibo-login', tooltipTitle: '查看微博登录帮助' }
    },
    {
      name: '微博图片批量下载',
      url: '/Weibo/ImagesDownload',
      icon: <IconWeiboOutlined />
    },
    {
      name: (
        <span>
          { ShowroomTextIcon }
          <span className="ml-[6px]">直播录制</span>
        </span>
      ),
      key: 'showroom',
      url: '/ShowroomLive/Live'
    },
    {
      name: '视频裁剪',
      url: '/VideoEdit/VideoCut',
      icon: <Icon className="text-[18px]" component={ IconCutSvgComponent } />
    }
  ],
  [
    {
      name: '视频合并',
      url: '/VideoEdit/Concat',
      icon: <Icon className="text-[18px]" component={ IconConcatSvgComponent } />
    },
    {
      name: '执行FFmpeg命令',
      url: '/VideoEdit/FFmpegProcess',
      icon: <Icon className="text-[18px]" component={ IconPowerShellSvgComponent } />
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
      let buttonLinkElement: ReactElement = (
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
      );

      if (navItem.help) {
        buttonLinkElement = createElement(HelpButtonGroup, Object.assign({
          spaceCompactProps: { className: 'flex' }
        }, navItem.help), buttonLinkElement);
      }

      groupElement.push(<div key={ typeof navItem.name === 'string' ? navItem.name : navItem.key }>{ buttonLinkElement }</div>);
    }

    element.push(
      <nav key={ `nav-${ i }` } className="grid grid-cols-4 gap-[16px] w-[800px]">
        { groupElement }
      </nav>,
      <Divider key={ `driver-${ i }` } className="my-[12px]" />
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
  const { ChangeThemeElement }: Theme = use(ThemeContext);
  const { buttonRender, modalRender }: UseAppDataDirReturnType = useAppDataDir();

  return (
    <Fragment>
      <div className="p-[16px]">
        { nativeRender() }
        <div className="w-[fit-content]">
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
              { ChangeThemeElement }
              <Tooltip title="开发者工具">
                <Button type="text" icon={ <IconToolTwoTone /> } onClick={ handleOpenDeveloperToolsClick } />
              </Tooltip>
              <Tooltip title="问题反馈">
                <Button id="issues" type="text" icon={ <IconBugTwoTone /> } onClick={ handleOpenIssuesClick } />
              </Tooltip>
              <ButtonLink linkProps={{ to: '/Agreement/Agreement' }} buttonProps={{ type: 'text' }}>License</ButtonLink>
            </Space>
          </div>
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
            <Image className="cursor-pointer !w-[180px]" src={ imageUrlZfbAvif } />
            <Image className="cursor-pointer !w-[180px]" src={ imageUrlWxAvif } />
          </Space>
        </div>
      </div>
      { modalRender() }
      { globalThis.__INITIAL_STATE__.isTest ? null : <NewUserTour /> }
    </Fragment>
  );
}

export default Index;