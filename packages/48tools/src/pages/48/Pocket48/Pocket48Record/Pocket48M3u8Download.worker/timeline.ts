export type HlsSegment = {
  uri: string;
  duration: number;
  discontinuity: boolean;
  localFilename: string;
};

export type StreamTimeline = {
  firstPts: number | null;
  lastPts: number | null;
  firstDts: number | null;
  lastDts: number | null;
  lastDuration: number | null;
  packetStep: number | null;
  startTime: number | null;
  endTime: number | null;
  firstPacketIsKey: boolean;
  codecSignature: string;
  codecExtraData: string;
};

export type SegmentTimeline = {
  video: StreamTimeline | null;
  audio: StreamTimeline | null;
};

const TIMELINE_TOLERANCE: number = 0.12;

/** 解析口袋48媒体m3u8，并为每个远端分片分配不会重名的本地文件名。 */
export function parseMediaPlaylist(data: string): HlsSegment[] {
  const result: HlsSegment[] = [];
  let duration: number | null = null;
  let discontinuity: boolean = false;

  for (const rawLine of data.split(/\r?\n/)) {
    const line: string = rawLine.trim();

    if (line.startsWith('#EXTINF:')) {
      const value: number = Number.parseFloat(line.slice('#EXTINF:'.length).split(',')[0]);

      duration = Number.isFinite(value) ? value : 0;
    } else if (line === '#EXT-X-DISCONTINUITY') {
      discontinuity = true;
    } else if (/^https?:\/\//i.test(line)) {
      result.push({
        uri: line,
        duration: duration ?? 0,
        discontinuity,
        localFilename: `_segment_${ String(result.length).padStart(6, '0') }.ts`
      });
      duration = null;
      discontinuity = false;
    }
  }

  return result;
}

function getBoundaryStart(stream: StreamTimeline): number | null {
  return stream.firstDts ?? stream.firstPts;
}

function getBoundaryEnd(stream: StreamTimeline): number | null {
  const lastTimestamp: number | null = stream.lastDts ?? stream.lastPts;

  if (lastTimestamp === null) return null;

  return lastTimestamp + (stream.lastDuration ?? stream.packetStep ?? 0);
}

function getGap(previous: StreamTimeline | null, current: StreamTimeline | null): number | null {
  if (!previous || !current) return null;

  const end: number | null = getBoundaryEnd(previous);
  const start: number | null = getBoundaryStart(current);

  return end === null || start === null ? null : start - end;
}

function changedCodec(previous: StreamTimeline | null, current: StreamTimeline | null): boolean {
  if (Boolean(previous) !== Boolean(current)) return true;
  if (!previous || !current) return false;
  if (previous.codecSignature !== current.codecSignature) return true;

  return Boolean(
    previous.codecExtraData
    && current.codecExtraData
    && previous.codecExtraData !== current.codecExtraData
  );
}

/**
 * 根据相邻分片的实际媒体数据判断来源是否发生切换。
 *
 * 切换app的典型特征是视频时间线出现异常缺口、音频仍然连续，且后一段
 * 从关键帧开始。这里只建立分组边界，不调整任何一路的时间戳。
 */
export function isSourceBoundary(
  currentSegment: HlsSegment,
  previous: SegmentTimeline,
  current: SegmentTimeline
): boolean {
  if (currentSegment.discontinuity) return true;

  if (changedCodec(previous.video, current.video) || changedCodec(previous.audio, current.audio)) {
    return true;
  }

  const videoGap: number | null = getGap(previous.video, current.video);
  const audioGap: number | null = getGap(previous.audio, current.audio);

  if (videoGap !== null && audioGap !== null) {
    const videoChanged: boolean = Math.abs(videoGap) > TIMELINE_TOLERANCE;
    const audioChanged: boolean = Math.abs(audioGap) > TIMELINE_TOLERANCE;
    const trackGapChanged: boolean = Math.abs(videoGap - audioGap) > TIMELINE_TOLERANCE;
    const startsWithKeyFrame: boolean = current.video?.firstPacketIsKey ?? false;

    if (startsWithKeyFrame && trackGapChanged && (videoChanged || audioChanged)) {
      return true;
    }

    return videoChanged && audioChanged;
  }

  const availableGap: number | null = videoGap ?? audioGap;

  return availableGap !== null && Math.abs(availableGap) > TIMELINE_TOLERANCE;
}

/** 将HLS分片按检测出的来源边界划分为连续来源组。 */
export function groupSegments(segments: HlsSegment[], timelines: SegmentTimeline[]): HlsSegment[][] {
  if (segments.length !== timelines.length) {
    throw new Error('HLS分片数量与媒体探测结果不一致。');
  }

  if (segments.length === 0) return [];

  const groups: HlsSegment[][] = [[segments[0]]];

  for (let index: number = 1; index < segments.length; index++) {
    if (isSourceBoundary(segments[index], timelines[index - 1], timelines[index])) {
      groups.push([]);
    }

    groups[groups.length - 1].push(segments[index]);
  }

  return groups;
}

/** 为一个连续来源组创建只引用本地分片的HLS清单。 */
export function createGroupPlaylist(segments: HlsSegment[]): string {
  const targetDuration: number = Math.max(
    1,
    ...segments.map((segment: HlsSegment): number => Math.ceil(segment.duration))
  );
  const lines: string[] = [
    '#EXTM3U',
    '#EXT-X-VERSION:3',
    `#EXT-X-TARGETDURATION:${ targetDuration }`,
    '#EXT-X-MEDIA-SEQUENCE:0',
    '#EXT-X-PLAYLIST-TYPE:VOD'
  ];

  for (const segment of segments) {
    lines.push(`#EXTINF:${ segment.duration.toFixed(6) },`);
    lines.push(segment.localFilename);
  }

  lines.push('#EXT-X-ENDLIST');

  return `${ lines.join('\n') }\n`;
}

/** 根据重封装后文件的实际包时间戳计算媒体时长。 */
export function getTimelineDuration(timeline: SegmentTimeline): number {
  const streams: StreamTimeline[] = [timeline.video, timeline.audio]
    .filter((stream: StreamTimeline | null): stream is StreamTimeline => stream !== null);
  const starts: number[] = streams
    .map((stream: StreamTimeline): number | null => stream.startTime)
    .filter((value: number | null): value is number => value !== null);
  const ends: number[] = streams
    .map((stream: StreamTimeline): number | null => stream.endTime)
    .filter((value: number | null): value is number => value !== null);

  if (starts.length === 0 || ends.length === 0) {
    throw new Error('无法从重封装文件中计算媒体时长。');
  }

  return Math.max(...ends) - Math.min(...starts);
}

/** 创建仅引用完整来源组文件的FFmpeg concat清单。 */
export function createGroupConcatFile(groupFiles: Array<{ filename: string; duration: number }>): string {
  const lines: string[] = ['ffconcat version 1.0'];

  for (const groupFile of groupFiles) {
    lines.push(`file '${ groupFile.filename.replaceAll("'", "'\\''") }'`);
    lines.push(`duration ${ groupFile.duration.toFixed(6) }`);
  }

  return `${ lines.join('\n') }\n`;
}
