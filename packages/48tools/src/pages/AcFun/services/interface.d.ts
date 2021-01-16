/* ========== Live ========== */
export interface AppVisitorLogin {
  result: number;
  acSecurity: string;
  userId: string;
  'acfun.api.visitor_st': string; // 后面需要的token
}

export interface WebToken {
  result: number;
  ssecurity: string;
  userId: number; // 用户名
  'acfun.midground.api_st': string; // 后面需要的token
  'acfun.midground.api.at': string;
}

export interface LiveWebStartPlay {
  result: number;
  data: {
    liveId: string;
    availableTickets: Array<string>;
    enterRoomAttach: string;
    videoPlayRes: string;
    caption: string;
    ticketRetryCount: number;
    ticketRetryIntervalMs: number;
    notices: Array<{
      userId: number;
      userName: string;
      userGender: string;
      notice: string;
    }>;
    config: {
      giftSlotSize: number;
    };
    liveStartTime: number;
    panoramic: boolean;
  };
  host: string;
}