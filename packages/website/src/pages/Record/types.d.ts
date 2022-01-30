import type { LiveInfo } from '../../../src-api/services/interface';

// 下载视频，同时标记是否被选中
export interface RecordLiveInfo extends LiveInfo {
  checked?: boolean;
}