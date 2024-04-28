export interface PcLiveJson {
  code: number;
  msg: string;
  error_code: number;
  data: {
    liveId: string;
    status: 1 | 3 | number; // 1: 直播中, 3: 直播结束
    cover: string;
    title: string;
    user: {
      uid: number;
      screenName: string;
    };
    live_origin_hls_url: string;
    live_origin_flv_url: string;
    replay_origin_url: string;
  };
}

// 访问列表
export interface VisitedSchemaItem {
  text: string;
  scheme_text?: string;
  scheme?: string;
}

export interface VisitedList {
  code: number;
  msg: string;
  data: {
    next_cursor: string;
    data: Array<VisitedSchemaItem | []>;
  };
  errno?: number;
  errmsg?: string;
}

// 关注
export interface SelfFollowedCardGroupItem {
  card_type: 10;
  itemid: string;
  users: {
    id: number;
    screen_name: string;
    cover_image_phone: string;
    followers_count: string;
    followers_count_str: string;
  };
  desc1: string;
  desc2: string;
}

export interface SelfFollowedCardItem {
  card_type: 11;
  card_group: Array<SelfFollowedCardGroupItem>;
}

export interface SelfFollowed {
  data: {
    cards: Array<SelfFollowedCardItem>;
  };
}

// 详细信息
export interface DetailInfo {
  data: {
    birthday: `${ string }座`;
    created_at: string;
    ip_location: string | `IP属地：${ string }`;
  };
}