import type { DashVideoItem } from '@48tools-api/bilibili/download';
import { BilibiliScrapy } from '../../../../scrapy/bilibili/BilibiliScrapy';
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
  const videoUrl: string = BilibiliScrapy.getVideoUrl(videoItem);
  const audioUrl: string = BilibiliScrapy.getVideoUrl(dash.dash.audio[0]);

  return { videoUrl, audioUrl };
}