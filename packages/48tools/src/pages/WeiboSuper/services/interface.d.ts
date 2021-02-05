import { SuperItem } from '../types';

export interface TopicResponse {
  ok: number;
  data: {
    total_number: number;
    list: Array<SuperItem>;
  };
}

export interface CheckinResult {
  code: string | number;
  msg: string;
  data: {
    tipMessage: string;
    alert_title: string;
    alert_subtitle: string;
    alert_activity: string;
  };
}