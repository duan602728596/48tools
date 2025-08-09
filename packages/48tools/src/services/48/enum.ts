/**
 * 直播类型
 * 1：直播，2：电台，5：游戏
 */
export const enum Pocket48LiveType {
  Live = 1,
  Radio = 2,
  Game = 5,
  AI = 6
}

/**
 * 直播类型
 * 0：正常，1：录屏
 */
export const enum Pocket48LiveMode {
  Normal = 0,
  Record = 1
}

export const enum PlayStreamName {
  SD = '标清',
  HD = '高清',
  FHD = '超清'
}