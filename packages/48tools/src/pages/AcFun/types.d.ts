/* ========== Download ========== */
export interface Representation {
  m3u8Slice: string;
  url: string;
  qualityLabel: string;
}

export interface KsPlayJson {
  adaptationSet: Array<{
    duration: number;
    id: number;
    representation: Array<Representation>;
  }>;
}

export interface PageInfo {
  currentVideoInfo: {
    ksPlayJson: string;
  };
}