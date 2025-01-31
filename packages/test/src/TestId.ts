/**
 * 统一记录所有测试用例的ID
 */

export const PartialTest: Record<string, string> = {
  IndexName: 'index',
  Pocket48Name: 'pocket48',
  BilibiliName: 'bilibili',
  AcFunName: 'acfun',
  DouyinName: 'douyin',
  WeiboName: 'weibo',
  KuaishouName: 'kuaishou'
};

/* Index */
export const Index: Record<string, number> = {
  Index1: 100
};

export const IndexVP: Record<string, number> = {
  Light: 1001,
  Dark: 1002
};

/* 48 */
export const SNH48InVideo: Record<string, number> = {
  SNH48: 200,
  BEJ48: 201,
  GNZ48: 202,
  CKG48: 203,
  CGT48: 204
};

export const Pocket48Record: Record<string, number> = {
  ShouldGetRecordData: 205,
  ShouldSearchRecordData: 206
};

export const Live48OptionsVP: Record<string, number> = {
  Light: 2001,
  Dark: 2002
};

export const Pocket48RoomMessageVP: Record<string, number> = {
  Light: 2003,
  Dark: 2004
};

/* AcFun */
export const AcFunDownload: Record<string, number> = {
  GetVideo: 300,
  DownloadVideo: 301
};

export const AcFunLive: Record<string, number> = {
  GetLiveVideo: 302
};

/* BiliBili*/
export const BiliBiliDownload: Record<string, number> = {
  GetBilibiliVideo: 400,
  GetBilibiliVideoWithProxy: 401,
  GetBilibiliVideoById: 402,
  DownloadBilibiliVideo: 403,
  WithOtherResolution: 404
};

export const BiliBiliLive: Record<string, number> = {
  GetLiveVideo: 405
};

/* 抖音 */
export const DouyinVideo: Record<string, number> = {
  GetVideoByFullUrl: 500,
  GetVideoByVideoId: 501,
  GetVideoByShareUrl: 502,
  GetImagesByFullUrl: 503,
  GetImagesByNoteId: 504,
  GetImagesByShareUrl: 505
};

export const DouyinUser: Record<string, number> = {
  GetUserInfoByFullUrl: 506,
  GetUserInfoByUserId: 507,
  GetUserInfoByShareUrl: 508
};

export const DouyinLive: Record<string, number> = {
  GetLiveVideo: 509
};

export const DouyinDownloadVP: Record<string, number> = {
  Light: 5001,
  Dark: 5002
};

/* 微博 */
export const Weibo: Record<string, number> = {
  LiveVideo: 600
};

/* 快手 */
export const KuaishouDownload: Record<string, number> = {
  GetKuaishouVideo: 700
};

export const KuaishouVideoDownloadVP: Record<string, number> = {
  Light: 7001,
  Dark: 7002
};

export const KuaishouLiveVP: Record<string, number> = {
  Light: 7003,
  Dark: 7004
};