import type { UploadFileResult } from 'nim-web-sdk-ng/dist/QCHAT_BROWSER_SDK/CloudStorageServiceInterface';
import type { QChatMessage } from 'nim-web-sdk-ng/dist/QCHAT_BROWSER_SDK/QChatMsgServiceInterface';
import type { FieldData } from 'rc-field-form/es/interface';
import type { WebWorkerChildItem } from '../../commonTypes';
import type { MsgType } from './services/interface';

export interface InLiveFormValue {
  type?: string;
  live?: string;
  quality: string;
}

/* ========== live48 ========== */
// 公演直播抓取列表
export interface InLiveWebWorkerItem {
  id: string;
  type: string;
  live: string;
  quality: string;
  playStreamPath: string;
  status?: number;
  timer?: NodeJS.Timeout; // 定时器，监听直播是否开始
  worker?: Worker;
}

export type InLiveWebWorkerItemNoplayStreamPath = Omit<InLiveWebWorkerItem, 'playStreamPath'>;

/* ========== pocket48 ========== */
// 直播自动录制配置
export interface Pocket48LiveAutoGrabOptions {
  time: number;
  users: string;
  dir: string;
}

/* ========== inVideo ========== */
export interface InVideoQuery {
  page?: number;     // 当前页数
  total?: number;    // 数据总数
  liveType?: string;
}

export interface InVideoItem {
  title: string;
  id: string;
  description: string;
  liveType: string;
}

export interface InVideoWebWorkerItem extends WebWorkerChildItem {
  liveType: string;
}

export interface RecordFieldData extends FieldData {
  value: any;
  touched?: boolean;
  validating?: boolean;
  errors?: string[];
}

// 录播的webworker下载
export interface RecordVideoDownloadWebWorkerItem extends WebWorkerChildItem {
  isM3u8?: boolean; // 是否为m3u8
  downloadType: 0 | 1;
}

// 查询
export interface QueryRecord {
  serverId: number;
  channelId: number;
  ownerId: number;
  ownerName: string;
  nextTime: number;
}

/* 口袋房间格式化 */
interface UserV2 {
  avatar: string;
  level: `${ number }`;
  nickName: string;
  roleId: number;
  teamLogo: string;
  userId: number;
  vip: boolean;
}

// roleId = 3为xox
interface CustomMessageV2 {
  user: UserV2;
  type: string;
  time: string;
  msgIdClient: string;
}

// 普通信息
export interface TEXTMessageV2 extends CustomMessageV2 {
  type: 'text';
  body: string;
}

// 图片信息
export interface IMAGEMessageV2 extends CustomMessageV2 {
  type: 'image';
  attach: UploadFileResult;
}

// 回复信息，礼物回复信息
export interface ReplyInfo {
  replyName: string;
  replyText: string; // 被回复的消息
  text: string;      // 回复的消息
}

export interface REPLYMessageV2 extends CustomMessageV2 {
  type: 'custom';
  attach: {
    messageType: 'REPLY' | 'GIFTREPLY';
    replyInfo: ReplyInfo;
    giftReplyInfo: ReplyInfo;
  };
}

// 发送语音
export interface AUDIOMessageV2 extends CustomMessageV2 {
  type: 'audio';
  attach: UploadFileResult;
}

export interface AUDIOMessage1_V2 extends CustomMessageV2 {
  type: 'custom';
  attach: {
    messageType: 'AUDIO';
    audioInfo: {
      url: string;
    };
  };
}

// 发送短视频
export interface VIDEOMessageV2 extends CustomMessageV2 {
  type: 'video';
  attach: UploadFileResult;
}

export interface VIDEOMessage1_V2 extends CustomMessageV2 {
  type: 'custom';
  attach: {
    messageType: 'VIDEO';
    videoInfo: {
      url: string;
    };
  };
}

// 直播
export interface LIVEPUSHMessageV2 extends CustomMessageV2 {
  type: 'custom';
  attach: {
    messageType: 'LIVEPUSH';
    livePushInfo: {
      liveCover: string;
      liveTitle: string;
      liveId: string;
      shortPath: string;
    };
  };
}

// 鸡腿翻牌
export interface FlipCardInfo {
  question: string;
  answer: string;
}

export interface FLIPCARDMessageV2 extends CustomMessageV2 {
  type: 'custom';
  attach: {
    messageType: 'FLIPCARD';
    flipCardInfo: FlipCardInfo;
    filpCardInfo: FlipCardInfo;
  };
}

// 发送表情
export interface EXPRESSMessageV2 extends CustomMessageV2 {
  type: 'custom';
  attach: {
    messageType: 'EXPRESS';
  };
}

// 删除回复
export interface DELETEMessageV2 extends CustomMessageV2 {
  type: 'custom';
  attach: {
    messageType: 'DELETE';
    targetId: string;
  };
}

// 禁言
export interface DISABLE_SPEAKMessageV2 extends CustomMessageV2 {
  type: 'custom';
  attach: {
    messageType: 'DISABLE_SPEAK';
    targetId: string;
    sourceId: string;
  };
}

// 电台
export interface SESSION_DIANTAIMessageV2 extends CustomMessageV2 {
  type: 'custom';
  attach: {
    messageType: 'SESSION_DIANTAI';
    streamPath: string;
  };
}

// 语音翻牌
export interface FlipCardAudioInfo {
  answer: `{
    "url": "${ string }.aac",
    "duration": ${ number },
    "size": ${ number }
  }`;
  answerId: string;
  answerType: string;
  question: string;
  questionId: string;
  sourceId: string;
  roomId: string;
}

export interface FLIPCARD_AUDIOMessageV2 extends CustomMessageV2 {
  type: 'custom';
  attach: {
    messageType: 'FLIPCARD_AUDIO';
    flipCardInfo: FlipCardAudioInfo;
    flipCardAudioInfo: FlipCardAudioInfo;
    filpCardInfo: FlipCardAudioInfo;
    filpCardAudioInfo: FlipCardAudioInfo;
  };
}

// 视频翻牌
export interface FlipCardVideoInfo {
  answer: `{
    "url": "${ string }.mp4",
    "duration": ${ number },
    "size": ${ number },
    "previewImg": "${ string }",
    "width": ${ number },
    "height": ${ number }
  }`;
  answerId: string;
  answerType: string;
  question: string;
  questionId: string;
  sourceId: string;
  roomId: string;
}

export interface FLIPCARD_VIDEOMessageV2 extends CustomMessageV2 {
  type: 'custom';
  attach: {
    messageType: 'FLIPCARD_VIDEO';
    flipCardInfo: FlipCardVideoInfo;
    flipCardVideoInfo: FlipCardVideoInfo;
    filpCardInfo: FlipCardVideoInfo;
    filpCardVideoInfo: FlipCardVideoInfo;
  };
}

// 2021表情包
export interface EXPRESSIMAGEMessageV2 extends CustomMessageV2 {
  type: 'custom';
  attach: {
    messageType: 'EXPRESSIMAGE';
    expressImgInfo: {
      emotionRemote: string;
    };
    emotionRemote: string;
  };
}

// open live
export interface OPEN_LIVEMessageV2 extends CustomMessageV2 {
  type: 'custom';
  attach: {
    messageType: 'OPEN_LIVE';
    openLiveInfo: {
      title: string;
      id: number;
      coverUrl: string;
      jumpPath: string;
    };
  };
}

// trip info
export interface TRIP_INFOMessageV2 extends CustomMessageV2 {
  type: 'custom';
  attach: {
    messageType: 'TRIP_INFO';
    tripInfo: {
      tripType: string;
      id: number;
      title: string;
      describe: string;
      jumpPath: string;
      jumpType: string;
    };
  };
}

// 礼物
export interface PRESENT_NORMALMessageV2 extends CustomMessageV2 {
  type: 'custom';
  attach: {
    messageType: 'PRESENT_NORMAL';
    giftInfo: {
      giftName: string;
      picPath: string;
    };
  };
}

// 投票信息：投票时，同时触发 PRESENT_TEXT 和 PRESENT_FULLSCREEN 两种类型
export interface PRESENT_TEXTMessageV2 extends CustomMessageV2 {
  type: 'custom';
  attach: {
    messageType: 'PRESENT_TEXT';
    giftInfo: {
      fullPicPath?: string; // 完整图片，图片地址以 https://source.48.cn/ 开头
      giftId: string;
      giftName: `${ number }投票权`; // 礼物名称
      giftNum: number;  // 礼物数量
      picPath: string;
      special: true;
    };
  };
}

// 发起投票
export interface VOTEMessageV2 extends CustomMessageV2 {
  type: 'custom';
  attach: {
    messageType: 'VOTE';
    voteInfo: {
      text: string;
      content: string;
    };
  };
}

// 房间关闭信息
export interface CLOSE_ROOM_CHATMessageV2 extends CustomMessageV2 {
  type: 'custom';
  attach: {
    messageType: 'CLOSE_ROOM_CHAT';
  };
}

// 中秋活动
export interface ZHONGQIU_ACTIVITY_LANTERN_FANSMessageV2 extends CustomMessageV2 {
  type: 'custom';
  attach: {
    messageType: 'ZHONGQIU_ACTIVITY_LANTERN_FANS';
  };
}

// 未格式化的原始数据，有些数据不想处理了
export interface RawData extends CustomMessageV2 {
  type: 'raw';
  body: string;
  extInfo: string;
}

export type FormatCustomMessage =
  | TEXTMessageV2
  | REPLYMessageV2
  | IMAGEMessageV2
  | AUDIOMessageV2
  | VIDEOMessageV2
  | AUDIOMessage1_V2
  | VIDEOMessage1_V2
  | LIVEPUSHMessageV2
  | FLIPCARDMessageV2
  | EXPRESSMessageV2
  | DELETEMessageV2
  | DISABLE_SPEAKMessageV2
  | SESSION_DIANTAIMessageV2
  | FLIPCARD_AUDIOMessageV2
  | FLIPCARD_VIDEOMessageV2
  | EXPRESSIMAGEMessageV2
  | OPEN_LIVEMessageV2
  | TRIP_INFOMessageV2
  | PRESENT_NORMALMessageV2
  | PRESENT_TEXTMessageV2
  | VOTEMessageV2
  | CLOSE_ROOM_CHATMessageV2
  | ZHONGQIU_ACTIVITY_LANTERN_FANSMessageV2
  | RawData;

/* 保存的数据 */
interface SendDataBase {
  msgTime: string;
  extInfo: string | { user: UserV2 };
  msgType: MsgType;
  bodys: Record<string, any> | string;
}

export interface TEXTSendData extends SendDataBase {
  msgType: 'TEXT';
  bodys: string;
}

export interface REPLYSendData extends SendDataBase {
  msgType: 'REPLY' | 'GIFTREPLY';
  bodys: REPLYMessageV2['attach'];
}

export interface MEDIASendData extends SendDataBase {
  msgType: 'IMAGE' | 'VIDEO' | 'AUDIO';
  bodys: UploadFileResult;
}

export interface LIVEPUSHSendData extends SendDataBase {
  msgType: 'LIVEPUSH';
  bodys: LIVEPUSHMessageV2['attach'];
}

export interface FLIPCARDSendData extends SendDataBase {
  msgType: 'FLIPCARD';
  bodys: FLIPCARDMessageV2['attach'];
}

export interface FLIPCARD_AUDIOSendData extends SendDataBase {
  msgType: 'FLIPCARD_AUDIO';
  bodys: FLIPCARD_AUDIOMessageV2['attach'];
}

export interface FLIPCARD_VIDEOSendData extends SendDataBase {
  msgType: 'FLIPCARD_VIDEO';
  bodys: FLIPCARD_VIDEOMessageV2['attach'];
}

export interface EXPRESSIMAGESendData extends SendDataBase {
  msgType: 'EXPRESSIMAGE';
  bodys: EXPRESSIMAGEMessageV2['attach'];
}

export type SendDataItem = TEXTSendData
  | REPLYSendData
  | MEDIASendData
  | LIVEPUSHSendData
  | FLIPCARDSendData
  | FLIPCARD_AUDIOSendData
  | FLIPCARD_VIDEOSendData
  | EXPRESSIMAGESendData;

/* ========== Room voice ========== */
export interface RoomVoiceItem {
  id: string;
  channelId: number;
  serverId: number;
  nickname: string;
  autoRecord?: boolean;
}

// 房间电台
export interface TeamVoiceMessage {
  type: 'custom';
  attach: {
    messageType: 'TEAM_VOICE';
    voiceInfo: {
      voiceStarInfoList: Array<{
        userId: number;
        nickname: string;
        avatar: string;
        pfUrl: string;
        voiceStatus: boolean;
      }>;
      streamUrl: string;
      operateType: 'upVoice';
    };
  };
}

/* ========== 青春时刻 ========== */
export interface QingchunshikeUserItem {
  id: string;
  userId: string;
  serverId: string;
  channelId: string;
  liveRoomId: string;
  description: string;
}

export interface GiftText {
  type: 'custom';
  attach: {
    messageType: 'GIFT_TEXT';
    giftInfo: {
      acceptUserId: number;
      acceptUserName: string;
      userName: string;
      giftName: string;
      giftNum: number;
      picPath: string;
      tpNum: number | string | '0';
    };
  };
}

export interface GiftResult {
  tpNum: number;
  giftNum: number;
}