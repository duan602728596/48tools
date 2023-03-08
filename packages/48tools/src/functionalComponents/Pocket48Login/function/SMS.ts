import { setInterval, clearInterval } from 'node:timers';

/* 发送短信倒计时 */
class SMS {
  time: number = 0;
  timer: NodeJS.Timer | number | null = null;
  event: Event = new Event('sms');

  // 倒计时
  smsTimer: Function = (): void => {
    this.time -= 1;

    if (this.time === 0 && this.timer !== null) {
      clearInterval(this.timer);
    }

    this.event['data'] = this.time;
    document.dispatchEvent(this.event);
  };

  start(): void {
    this.time = 180;
    this.timer = setInterval(this.smsTimer, 1_000);
  }
}

export default SMS;