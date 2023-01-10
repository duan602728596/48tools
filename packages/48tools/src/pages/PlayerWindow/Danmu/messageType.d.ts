export interface LiveRoomCustomUser {
  pfUrl: string;
  teamLogo: string;
  badge: Array<unknown>;
  level: number;
  nickName: string;
  roleId: number;
  avatar: string;
  vip: boolean;
  userId: number;
}

// 礼物custom类型
export interface LiveRoomGiftInfoCustom {
  giftInfo: {
    giftId: number;
    giftName: string;
    picPath: string;
    switchTime: number;
    click: boolean;
    special: boolean;
    giftNum: number;
    zipPath: string;
    sourceId: string;
    acceptUser: {
      userId: number;
      userAvatar: string;
      userName: string;
    };
  };
  liveBubbleId: string;
  liveBubbleIosUrl: string;
  liveBubbleAndroidUrl: string;
  specialBadge: Array<unknown>;
  fromApp: string;
  roomId: string;
  module: 'LIVE';
  sourceId: string;
  messageType: 'PRESENT_NORMAL';
  user: LiveRoomCustomUser;
  sessionRole: string;
}

// 弹幕custom类型
export interface LiveRoomCustom {
  sourceId: string;
  liveBubbleId: number;
  sessionRole: number;
  fromApp: string;
  module: 'live';
  inTop: boolean;
  liveBubbleAndroidUrl: string;
  roomId: `${ number }`;
  messageType: 'BARRAGE_NORMAL' | string;
  liveBubbleIosUrl: string;
  bubbleId: string;
  text: string;
  user: LiveRoomCustomUser;
  config: {
    mobileOperators: string;
    phoneSystemVersion: string;
    build: string;
    version: string;
    phoneName: string;
  };
  md5: string;
}

export interface LiveRoomMessage {
  chatroomId: `${ number }`;
  custom: `{${ string }}`;
  flow: string | 'in';
  from: string | 'admin';
  fromAvatar: string;
  fromClientType: string | 'Server';
  fromCustom: string;
  fromNick: string | '不是革青韦';
  idClient: string;
  resend: boolean;
  status: string;
  text: string;
  time: number;
  type: 'text' | 'custom';
  userUpdateTime: number;
  vid: string;
}