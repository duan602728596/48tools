import { shell } from 'electron';
import { Fragment, useState, type ReactElement, type Dispatch as D, type SetStateAction as S, type MouseEvent } from 'react';
import { Button, Tour, type TourStepProps } from 'antd';
import { ffmpegInstallHtmlPage } from '../../../utils/utils';

const NOW_USER_TOUR_VERSION_KEY: 'USER_TOUR_VERSION' = 'USER_TOUR_VERSION';
const NOW_USER_TOUR_VERSION: '1' = '1'; // 当前引导版本
const userTourVersion: string | null = localStorage.getItem(NOW_USER_TOUR_VERSION_KEY); // 本地引导版本
const displayUserTourVersion: boolean = NOW_USER_TOUR_VERSION !== userTourVersion;

/* 新手引导 */
function NewUserTour(): ReactElement | null {
  const [tourOpen, setTourOpen]: [boolean, D<S<boolean>>] = useState(displayUserTourVersion);

  // 引导中
  function handleCurrentChange(): void {
    localStorage.setItem(NOW_USER_TOUR_VERSION_KEY, NOW_USER_TOUR_VERSION);
  }

  // 结束引导
  function handleFinishTourClick(): void {
    localStorage.setItem(NOW_USER_TOUR_VERSION_KEY, NOW_USER_TOUR_VERSION);
    setTourOpen(false);
  }

  // 下载ffmpeg
  function handleOpenIssuesClick(event: MouseEvent): void {
    shell.openExternal(ffmpegInstallHtmlPage);
  }

  const steps: Array<TourStepProps> = [
    {
      title: '配置FFmpeg路径',
      description: (
        <Fragment>
          因为软件的功能涉及到视频转码。所以在使用软件之前，请先
          <Button className="mx-[6px]" onClick={ handleOpenIssuesClick }>下载FFmpeg</Button>。然后配置
          <b>FFmpeg可执行文件的路径</b>。
        </Fragment>
      ),
      target: (): HTMLElement => document.getElementById('ffmpeg-options')!
    },
    {
      title: '配置无头浏览器路径',
      description: (
        <Fragment>
          <b>“微博超话签到“的登录</b>和
          <b>”口袋房间消息“的资源本地化</b>
          需要使用无头浏览器的功能。所以在使用这些功能之前，请先配置
          <b>无头浏览器的文件路径</b>。
        </Fragment>
      ),
      target: (): HTMLElement => document.getElementById('executable-path')!
    },
    {
      title: '使用手册',
      description: '如果你在配置时不知道选择哪个文件，或者有其他使用方面的问题，可以在这里打开使用手册。',
      target: (): HTMLElement => document.getElementById('help-doc')!
    },
    {
      title: '问题反馈',
      description: '如果你在使用时遇到了Bug，请到Github反馈遇到的问题。',
      target: (): HTMLElement => document.getElementById('issues')!
    }
  ];

  return displayUserTourVersion ? (
    <Tour open={ tourOpen }
      steps={ steps }
      onChange={ handleCurrentChange }
      onFinished={ handleFinishTourClick }
      onClose={ handleFinishTourClick }
    />
  ) : null;
}

export default NewUserTour;