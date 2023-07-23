import { useState, type ReactElement, type Dispatch as D, type SetStateAction as S } from 'react';
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
      description: '因为软件的功能涉及到视频转码。所以在使用软件之前，请先下载FFmpeg。',
      target: (): HTMLElement => document.getElementById('ffmpeg-options')!
    },
    {
      title: '配置无头浏览器路径',
      description: '微博超话签到的登录和口袋房间消息的资源本地化需要使用无头浏览器的功能。所以在使用这些功能之前，请先配置无头浏览器的地址。',
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
    <Tour type="primary"
      open={ tourOpen }
      steps={ steps }
      mask={ false }
      onChange={ handleCurrentChange }
      onFinished={ handleFinishTourClick }
      onClose={ handleFinishTourClick }
    />
  ) : null;
}

export default NewUserTour;