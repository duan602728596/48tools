/**
 * 统一记录所有测试用例的ID
 */

export const enum PartialTest {
  IndexName = 'index',
  Pocket48Name = 'pocket48',
  BilibiliName = 'bilibili',
  AcFunName = 'acfun',
  DouyinName = 'douyin',
  WeiboName = 'weibo'
}

/* Index */
export const enum Index {
  Index = 100
}

export const enum IndexVP {
  Light = 1001,
  Dark = 1002
}

/* 48 */
export const enum SNH48InVideo {
  SNH48 = 200,
  BEJ48 = 201,
  GNZ48 = 202,
  CKG48 = 203,
  CGT48 = 204
}

export const enum Pocket48Record {
  ShouldGetRecordData = 205,
  ShouldSearchRecordData = 206
}

export const enum Live48OptionsVP {
  Light = 2001,
  Dark = 2002
}

export const enum Pocket48RoomMessageVP {
  Light = 2003,
  Dark = 2004
}

/* AcFun */
export const enum AcFunDownload {
  GetVideo = 300,
  DownloadVideo = 301
}

export const enum AcFunLive {
  GetLiveVideo = 302
}

/* BiliBili*/
export const enum BiliBiliDownload {
  GetBilibiliVideo = 400,
  GetBilibiliVideoWithProxy = 401,
  GetBilibiliVideoById = 402,
  DownloadBilibiliVideo = 403,
  WithOtherResolution = 404
}

export const enum BiliBiliLive {
  GetLiveVideo = 405
}

/* 抖音 */
export const enum DouyinVideo {
  GetVideoByFullUrl = 500,
  GetVideoByVideoId = 501,
  GetVideoByShareUrl = 502,
  GetImagesByFullUrl = 503,
  GetImagesByNoteId = 504,
  GetImagesByShareUrl = 505
}

export const enum DouyinUser {
  GetUserInfoByFullUrl = 506,
  GetUserInfoByUserId = 507,
  GetUserInfoByShareUrl = 508
}

export const enum DouyinLive {
  GetLiveVideo = 509
}

export const enum DouyinDownloadVP {
  Light = 5001,
  Dark = 5002
}

/* 微博 */
export const enum Weibo {
  LiveVideo = 600
}