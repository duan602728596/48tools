import { inspectTsSegment, type SegmentProbeResult } from './inspectTs';

function encodePts(value: number): Buffer {
  const timestamp: number = Math.round(value * 90000);

  return Buffer.from([
    0x21 | (Math.floor(timestamp / 1073741824) << 1),
    Math.floor(timestamp / 4194304) & 0xff,
    ((Math.floor(timestamp / 32768) & 0x7f) << 1) | 1,
    Math.floor(timestamp / 128) & 0xff,
    ((timestamp & 0x7f) << 1) | 1
  ]);
}

function transportPacket(pid: number, payload: Buffer, startsUnit: boolean = true): Buffer {
  if (payload.length > 184) throw new Error('测试负载超过单个TS包容量。');

  const result: Buffer = Buffer.alloc(188, 0xff);

  result[0] = 0x47;
  result[1] = (startsUnit ? 0x40 : 0) | ((pid >> 8) & 0x1f);
  result[2] = pid & 0xff;
  result[3] = 0x10;
  payload.copy(result, 4);

  return result;
}

function psiPacket(pid: number, section: number[]): Buffer {
  return transportPacket(pid, Buffer.from([0, ...section]));
}

function pesPacket(pid: number, streamId: number, pts: number, data: Buffer): Buffer {
  return transportPacket(pid, Buffer.concat([
    Buffer.from([0, 0, 1, streamId, 0, 0, 0x80, 0x80, 5]),
    encodePts(pts),
    data
  ]));
}

function pat(): Buffer {
  return psiPacket(0, [
    0x00, 0xb0, 0x0d, 0x00, 0x01, 0xc1, 0x00, 0x00,
    0x00, 0x01, 0xf0, 0x00, 0, 0, 0, 0
  ]);
}

function pmt(withAudio: boolean): Buffer {
  const streams: number[] = [0x1b, 0xe1, 0x00, 0xf0, 0x00];

  if (withAudio) streams.push(0x0f, 0xe1, 0x01, 0xf0, 0x00);

  const sectionLength: number = 9 + streams.length + 4;

  return psiPacket(0x1000, [
    0x02, 0xb0 | ((sectionLength >> 8) & 0x0f), sectionLength & 0xff,
    0x00, 0x01, 0xc1, 0x00, 0x00, 0xe1, 0x00, 0xf0, 0x00,
    ...streams,
    0, 0, 0, 0
  ]);
}

function videoData(key: boolean): Buffer {
  return Buffer.from([
    0, 0, 0, 1, 0x67, 0x64, 0x00, 0x1f,
    0, 0, 0, 1, 0x68, 0xee, 0x3c, 0x80,
    0, 0, 0, 1, key ? 0x65 : 0x41, 0x88, 0x84
  ]);
}

function adtsFrame(): Buffer {
  const frameLength: number = 9;

  return Buffer.from([
    0xff, 0xf1, 0x50, 0x80 | (frameLength >> 11),
    (frameLength >> 3) & 0xff,
    ((frameLength & 0x07) << 5) | 0x1f,
    0xfc,
    0, 0
  ]);
}

function createSegment(withAudio: boolean): Buffer {
  const packets: Buffer[] = [
    pat(),
    pmt(withAudio),
    pesPacket(0x100, 0xe0, 0, videoData(true)),
    pesPacket(0x100, 0xe0, 0.05, videoData(false))
  ];

  if (withAudio) {
    packets.push(
      pesPacket(0x101, 0xc0, 0, adtsFrame()),
      pesPacket(0x101, 0xc0, 1024 / 44100, adtsFrame())
    );
  }

  return Buffer.concat(packets);
}

describe('Pocket48 MPEG-TS inspector', function(): void {
  test('extracts video and AAC timelines without ffprobe', function(): void {
    const result: SegmentProbeResult = inspectTsSegment(createSegment(true));

    expect(result.timeline.video?.firstPacketIsKey).toBe(true);
    expect(result.timeline.video?.packetStep).toBeCloseTo(0.05, 6);
    expect(result.timeline.audio?.packetStep).toBeCloseTo(2090 / 90000, 6);
    expect(result.audioFormat).toEqual({ sampleRate: '44100', channelLayout: 'stereo' });
  });

  test('reports a video-only source without inventing an audio timeline', function(): void {
    const result: SegmentProbeResult = inspectTsSegment(createSegment(false));

    expect(result.timeline.video).not.toBeNull();
    expect(result.timeline.audio).toBeNull();
    expect(result.audioFormat).toBeNull();
  });
});
