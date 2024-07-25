import type { DashVideoItem } from '@48tools-api/bilibili/download';
import type { DashInfo } from '../../types';

export interface GetUrlFromDashReturn {
  videoUrl: string;
  audioUrl: string;
}

/**
 * @param { DashInfo } dash
 * @param { number } quality
 */
export function getUrlFromDash(dash: DashInfo, quality: number): GetUrlFromDashReturn {
  const videoItem: DashVideoItem = dash.dash.video.find((o: DashVideoItem): boolean => o.id === quality)
    ?? dash.dash.video[0];
  const videoUrl: string = videoItem.backupUrl?.[0]
    ?? videoItem.backup_url?.[0]
    ?? videoItem.baseUrl
    ?? videoItem.base_url;
  const audioUrl: string = dash.dash.audio[0].backupUrl?.[0]
    ?? dash.dash.audio[0].backup_url?.[0]
    ?? dash.dash.audio[0].baseUrl
    ?? dash.dash.audio[0].base_url;

  return { videoUrl, audioUrl };
}