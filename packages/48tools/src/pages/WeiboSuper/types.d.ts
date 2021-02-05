export interface SuperItem {
  title: string;
  content1: string;
  content2: string;
  intro: string;
  link: string;
  pic: string;
  oid: string;
}

export interface WeiboCheckinResult {
  code?: number;
  result?: string;
  superId: string; // 超话id
  title: string;   // 超话名称
  pic: string;     // 超话图片
}