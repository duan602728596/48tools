export interface SuperItem {
  title: string; // 超话id
  content1: string;
  content2: string;
  intro: string;
  link: string;
  pic: string; // 超话图片
  oid: string;
}

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