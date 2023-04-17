import { setInterval, clearInterval } from 'node:timers';

type Listener = () => void;

/* 发送短信倒计时 */
class SMSStore {
  time: number = 0;
  timer: NodeJS.Timer | number | null = null;
  listeners: Array<Listener> = [];

  getSnapshot: () => number = (): number => {
    return this.time;
  };

  subscribe: (listener: Listener) => Listener = (listener: Listener): Listener => {
    this.listeners.push(listener);

    return (): void => {
      this.listeners.splice(this.listeners.indexOf(listener), 1);
    };
  };

  emit(): void {
    this.listeners.forEach((listener: Listener): void => listener());
  }

  // 倒计时
  smsTimer: Function = (): void => {
    this.time -= 1;

    if (this.time === 0 && this.timer !== null) {
      clearInterval(this.timer);
    }

    this.emit();
  };

  start(): void {
    this.time = 60;
    this.timer = setInterval(this.smsTimer, 1_000);
  }
}

export const smsStore: SMSStore = new SMSStore();