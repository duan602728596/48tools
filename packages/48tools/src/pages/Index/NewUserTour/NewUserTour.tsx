import { Fragment, useState, type ReactElement, type Dispatch as D, type SetStateAction as S } from 'react';
import { Tour, type TourStepProps } from 'antd';

const NOW_USER_TOUR_VERSION_KEY: 'USER_TOUR_VERSION' = 'USER_TOUR_VERSION';
const NOW_USER_TOUR_VERSION: '1' = '1'; // 当前引导版本
const userTourVersion: string | null = localStorage.getItem(NOW_USER_TOUR_VERSION_KEY); // 本地引导版本
const displayUserTourVersion: boolean = NOW_USER_TOUR_VERSION !== userTourVersion;

/* 新手引导 */
function NewUserTour(): ReactElement | null {
  const [tourOpen, setTourOpen]: [boolean, D<S<boolean>>] = useState(displayUserTourVersion);
  const steps: Array<TourStepProps> = [
    {
      title: '配置FFmpeg路径',
      description: (
        <Fragment>
          因为软件的功能涉及到视频转码。所以在使用软件之前，请先
          <b>下载FFmpeg</b>。然后配置
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
    }
  ];

  // 引导中
  function handleCurrentChange(): void {
    localStorage.setItem(NOW_USER_TOUR_VERSION_KEY, NOW_USER_TOUR_VERSION);
  }

  // 结束引导
  function handleFinishTourClick(): void {
    localStorage.setItem(NOW_USER_TOUR_VERSION_KEY, NOW_USER_TOUR_VERSION);
    setTourOpen(false);
  }

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