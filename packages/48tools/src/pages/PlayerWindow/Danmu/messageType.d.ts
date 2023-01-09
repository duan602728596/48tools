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
  custom: `{ ${ string } }`;
  flow: string;
  from: string;
  fromAvatar: string;
  fromClientType: string;
  fromCustom: string;
  fromNick: string;
  idClient: string;
  resend: boolean;
  status: string;
  text: string;
  time: number;
  type: 'text' | string;
  userUpdateTime: number;
}