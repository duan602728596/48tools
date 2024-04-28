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
  recommend?: [
    {
      name: '粉丝数';
      value: string;
    },
    {
      name: 'IP';
      value: string;
    },
    {
      name: '';
      value: `${ string }座`;
    }
  ];
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

// 关注（PC）
export interface FollowContentUserItem {
  id: number;
  idstr: string;
  description: string;
  avatar_hd: string;
  followers_count: number; // 这个地方是-1的
  followers_count_str: `${ number }` | `${ number }万`; // -1或x.x万
  name: string;
  screen_name: string;
}

export interface FollowContent {
  data: {
    follows: {
      users: Array<FollowContentUserItem>;
    };
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