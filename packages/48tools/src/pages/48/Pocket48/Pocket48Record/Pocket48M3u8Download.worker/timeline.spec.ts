import {
  groupSegments,
  isSourceBoundary,
  parseMediaPlaylist,
  type HlsSegment,
  type SegmentTimeline,
  type StreamTimeline
} from './timeline';

function stream(
  first: number,
  last: number,
  duration: number,
  firstPacketIsKey: boolean = false
): StreamTimeline {
  return {
    firstPts: first,
    lastPts: last,
    firstDts: first,
    lastDts: last,
    lastDuration: duration,
    packetStep: duration,
    startTime: first,
    endTime: last + duration,
    firstPacketIsKey,
    codecSignature: 'same-codec',
    codecExtraData: 'same-extra-data'
  };
}

const segment: HlsSegment = {
  uri: 'https://example.test/segment.ts',
  duration: 5,
  discontinuity: false,
  localFilename: '_segment_000000.ts'
};

describe('Pocket48 m3u8 timeline', function(): void {
  test('parses durations, discontinuities and unique local filenames', function(): void {
    const result: HlsSegment[] = parseMediaPlaylist([
      '#EXTM3U',
      '#EXTINF:5.3,',
      'https://example.test/repeated.ts?part=1',
      '#EXT-X-DISCONTINUITY',
      '#EXTINF:5.852,',
      'https://example.test/repeated.ts?part=2'
    ].join('\n'));

    expect(result).toEqual([
      {
        uri: 'https://example.test/repeated.ts?part=1',
        duration: 5.3,
        discontinuity: false,
        localFilename: '_segment_000000.ts'
      },
      {
        uri: 'https://example.test/repeated.ts?part=2',
        duration: 5.852,
        discontinuity: true,
        localFilename: '_segment_000001.ts'
      }
    ]);
  });

  test('detects the measured app-switch boundary without a fixed player time', function(): void {
    const before: SegmentTimeline = {
      video: stream(0, 5, 0.05, true),
      audio: stream(0.001811, 5.203089, 0.023211, true)
    };
    const after: SegmentTimeline = {
      video: stream(5.3, 11.102, 0.05, true),
      audio: stream(5.2263, 11.100956, 0.023211, true)
    };

    expect(isSourceBoundary(segment, before, after)).toBe(true);
  });

  test('does not split a continuous media boundary', function(): void {
    const before: SegmentTimeline = {
      video: stream(0, 4.95, 0.05, true),
      audio: stream(0, 4.976789, 0.023211, true)
    };
    const after: SegmentTimeline = {
      video: stream(5, 9.95, 0.05, true),
      audio: stream(5, 9.976789, 0.023211, true)
    };

    expect(isSourceBoundary(segment, before, after)).toBe(false);
  });

  test('groups only at the dynamically detected source boundary', function(): void {
    const segments: HlsSegment[] = [
      segment,
      { ...segment, localFilename: '_segment_000001.ts' },
      { ...segment, localFilename: '_segment_000002.ts' }
    ];
    const timelines: SegmentTimeline[] = [
      { video: stream(0, 4.95, 0.05, true), audio: stream(0, 4.976789, 0.023211, true) },
      { video: stream(5, 9.95, 0.05, true), audio: stream(5, 9.976789, 0.023211, true) },
      { video: stream(10.25, 14.95, 0.05, true), audio: stream(10, 14.976789, 0.023211, true) }
    ];
    const groups: HlsSegment[][] = groupSegments(segments, timelines);

    expect(groups.map((group: HlsSegment[]): number => group.length)).toEqual([2, 1]);
  });
});
