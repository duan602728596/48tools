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
    tpNum: string;
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
export interface LiveRoomTextCustom {
  sourceId: string;
  liveBubbleId: number;
  sessionRole: number;
  fromApp: string;
  module: 'live';
  inTop: boolean;
  liveBubbleAndroidUrl: string;
  roomId: `${ number }`;
  messageType: 'BARRAGE_NORMAL' | 'BARRAGE_MEMBER' | string;
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

interface LiveRoomBasicEvent {
  chatroomId: `${ number }`;
  custom: `{${ string }}`;
  fromAvatar: string;
  fromCustom: string;
  idClient: string;
  resend: boolean;
  status: string;
  time: number;
  userUpdateTime: number;
  vid: string; // vid是后添加的，用来标识不同的弹幕
}

export interface LiveRoomTextMessage extends LiveRoomBasicEvent {
  flow: string;
  from: string;
  fromClientType: string;
  fromNick: string;
  text: string;
  type: 'text';
}

export interface LiveRoomServerGiftInfoMessage extends LiveRoomBasicEvent {
  content: `{${ string }}`;
  flow: 'in';
  from: 'admin';
  fromClientType: 'Server';
  fromNick: '不是革青韦';
  type: 'custom';
}

export interface LiveRoomMemberBarrage extends LiveRoomBasicEvent {
  content: `{${ string }}`;
  from: string;
  fromClientType: string;
  fromNick: string;
  text: string;
  type: 'custom';
}

export type LiveRoomUserMessage = LiveRoomTextMessage | LiveRoomMemberBarrage;
export type LiveRoomMessage = LiveRoomUserMessage | LiveRoomServerGiftInfoMessage;