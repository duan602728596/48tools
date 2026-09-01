import type { SegmentTimeline, StreamTimeline } from './timeline';

export type AudioFormat = {
  sampleRate: string;
  channelLayout: string;
};

export type SegmentProbeResult = {
  timeline: SegmentTimeline;
  audioFormat: AudioFormat | null;
};

type StreamDefinition = {
  pid: number;
  kind: 'video' | 'audio';
  codec: 'h264' | 'hevc' | 'aac';
};

type TransportPayload = {
  pid: number;
  startsUnit: boolean;
  data: Buffer;
};

type PendingPes = {
  pts: number | null;
  dts: number | null;
  chunks: Buffer[];
};

type PesPacket = {
  pts: number | null;
  dts: number | null;
  data: Buffer;
};

type MediaPacket = {
  pts: number | null;
  dts: number | null;
  duration: number | null;
  key: boolean;
};

type AudioInspection = {
  packets: MediaPacket[];
  format: AudioFormat | null;
  codecSignature: string;
  codecExtraData: string;
};

const TS_PACKET_SIZE: number = 188;
const CLOCK_RATE: number = 90000;
const AAC_SAMPLE_RATES: number[] = [
  96000, 88200, 64000, 48000, 44100, 32000, 24000,
  22050, 16000, 12000, 11025, 8000, 7350
];
const UNSUPPORTED_MEDIA_TYPES: Set<number> = new Set([
  0x01, 0x02, 0x03, 0x04, 0x10, 0x11, 0x1f, 0x20,
  0x21, 0x42, 0x81, 0x87, 0xea
]);

function median(values: number[]): number | null {
  if (values.length === 0) return null;

  const sorted: number[] = [...values].sort((a: number, b: number): number => a - b);
  const middle: number = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
}

function findPacketOffset(data: Buffer): number {
  const searchLength: number = Math.min(TS_PACKET_SIZE, data.length);

  for (let offset: number = 0; offset < searchLength; offset++) {
    if (data[offset] !== 0x47) continue;
    if (offset + TS_PACKET_SIZE >= data.length || data[offset + TS_PACKET_SIZE] === 0x47) return offset;
  }

  throw new Error('TS分片中没有找到同步字节。');
}

function getTransportPayload(data: Buffer, offset: number): TransportPayload | null {
  if (data[offset] !== 0x47 || offset + TS_PACKET_SIZE > data.length) return null;
  if ((data[offset + 1] & 0x80) !== 0) return null;

  const pid: number = ((data[offset + 1] & 0x1f) << 8) | data[offset + 2];
  const startsUnit: boolean = (data[offset + 1] & 0x40) !== 0;
  const adaptationControl: number = (data[offset + 3] >> 4) & 0x03;

  if (adaptationControl === 0 || adaptationControl === 2) return null;

  let payloadOffset: number = offset + 4;

  if (adaptationControl === 3) {
    payloadOffset += 1 + data[payloadOffset];
  }

  const packetEnd: number = offset + TS_PACKET_SIZE;

  if (payloadOffset >= packetEnd) return null;

  return {
    pid,
    startsUnit,
    data: data.subarray(payloadOffset, packetEnd)
  };
}

function getPsiSection(payload: Buffer): Buffer | null {
  if (payload.length < 4) return null;

  const sectionStart: number = 1 + payload[0];

  if (sectionStart + 3 > payload.length) return null;

  const sectionLength: number = ((payload[sectionStart + 1] & 0x0f) << 8) | payload[sectionStart + 2];
  const sectionEnd: number = sectionStart + 3 + sectionLength;

  return sectionEnd <= payload.length ? payload.subarray(sectionStart, sectionEnd) : null;
}

function parsePat(payload: Buffer): number | null {
  const section: Buffer | null = getPsiSection(payload);

  if (!section || section[0] !== 0x00 || section.length < 12) return null;

  const entriesEnd: number = section.length - 4;

  for (let offset: number = 8; offset + 4 <= entriesEnd; offset += 4) {
    const programNumber: number = (section[offset] << 8) | section[offset + 1];

    if (programNumber !== 0) {
      return ((section[offset + 2] & 0x1f) << 8) | section[offset + 3];
    }
  }

  return null;
}

function getStreamDefinition(streamType: number, pid: number): StreamDefinition | null {
  switch (streamType) {
    case 0x1b:
      return { pid, kind: 'video', codec: 'h264' };

    case 0x24:
      return { pid, kind: 'video', codec: 'hevc' };

    case 0x0f:
      return { pid, kind: 'audio', codec: 'aac' };

    default:
      return null;
  }
}

function parsePmt(payload: Buffer): StreamDefinition[] {
  const section: Buffer | null = getPsiSection(payload);

  if (!section || section[0] !== 0x02 || section.length < 16) return [];

  const programInfoLength: number = ((section[10] & 0x0f) << 8) | section[11];
  const streamsEnd: number = section.length - 4;
  const result: StreamDefinition[] = [];
  let offset: number = 12 + programInfoLength;

  while (offset + 5 <= streamsEnd) {
    const streamType: number = section[offset];
    const pid: number = ((section[offset + 1] & 0x1f) << 8) | section[offset + 2];
    const infoLength: number = ((section[offset + 3] & 0x0f) << 8) | section[offset + 4];
    const definition: StreamDefinition | null = getStreamDefinition(streamType, pid);

    if (definition) result.push(definition);
    else if (UNSUPPORTED_MEDIA_TYPES.has(streamType)) {
      throw new Error(`暂不支持进程内解析TS流类型：0x${ streamType.toString(16) }`);
    }

    offset += 5 + infoLength;
  }

  return result;
}

function discoverStreams(data: Buffer, packetOffset: number): StreamDefinition[] {
  let pmtPid: number | null = null;
  const streams: Map<number, StreamDefinition> = new Map();

  for (let offset: number = packetOffset; offset + TS_PACKET_SIZE <= data.length; offset += TS_PACKET_SIZE) {
    const payload: TransportPayload | null = getTransportPayload(data, offset);

    if (!payload?.startsUnit) continue;

    if (payload.pid === 0) {
      pmtPid = parsePat(payload.data) ?? pmtPid;
    } else if (pmtPid !== null && payload.pid === pmtPid) {
      for (const stream of parsePmt(payload.data)) streams.set(stream.pid, stream);
    }
  }

  if (streams.size === 0) throw new Error('TS分片中没有找到支持的音视频节目。');

  return [...streams.values()];
}

function decodeTimestamp(data: Buffer, offset: number): number | null {
  if (offset + 5 > data.length) return null;

  const value: number = (((data[offset] >> 1) & 0x07) * 1073741824)
    + (data[offset + 1] * 4194304)
    + (((data[offset + 2] >> 1) & 0x7f) * 32768)
    + (data[offset + 3] * 128)
    + ((data[offset + 4] >> 1) & 0x7f);

  return value / CLOCK_RATE;
}

function parsePesStart(payload: Buffer): PendingPes | null {
  if (payload.length < 9 || payload[0] !== 0 || payload[1] !== 0 || payload[2] !== 1) return null;

  const flags: number = payload[7];
  const headerLength: number = payload[8];
  const dataOffset: number = 9 + headerLength;

  if (dataOffset > payload.length) return null;

  return {
    pts: (flags & 0x80) !== 0 ? decodeTimestamp(payload, 9) : null,
    dts: (flags & 0x40) !== 0 ? decodeTimestamp(payload, 14) : null,
    chunks: [payload.subarray(dataOffset)]
  };
}

function finishPes(target: PesPacket[], pending: PendingPes | undefined): void {
  if (!pending) return;

  target.push({
    pts: pending.pts,
    dts: pending.dts ?? pending.pts,
    data: Buffer.concat(pending.chunks)
  });
}

function collectPesPackets(
  data: Buffer,
  packetOffset: number,
  streams: StreamDefinition[]
): Map<number, PesPacket[]> {
  const streamPids: Set<number> = new Set(streams.map((stream: StreamDefinition): number => stream.pid));
  const pending: Map<number, PendingPes> = new Map();
  const result: Map<number, PesPacket[]> = new Map(
    streams.map((stream: StreamDefinition): [number, PesPacket[]] => [stream.pid, []])
  );

  for (let offset: number = packetOffset; offset + TS_PACKET_SIZE <= data.length; offset += TS_PACKET_SIZE) {
    const payload: TransportPayload | null = getTransportPayload(data, offset);

    if (!payload || !streamPids.has(payload.pid)) continue;

    if (payload.startsUnit) {
      finishPes(result.get(payload.pid) as PesPacket[], pending.get(payload.pid));

      const next: PendingPes | null = parsePesStart(payload.data);

      if (next) pending.set(payload.pid, next);
      else pending.delete(payload.pid);
    } else {
      pending.get(payload.pid)?.chunks.push(payload.data);
    }
  }

  for (const stream of streams) {
    finishPes(result.get(stream.pid) as PesPacket[], pending.get(stream.pid));
  }

  return result;
}

function findNalStart(data: Buffer, from: number): { offset: number; length: number } | null {
  for (let offset: number = from; offset + 3 < data.length; offset++) {
    if (data[offset] !== 0 || data[offset + 1] !== 0) continue;

    if (data[offset + 2] === 1) return { offset, length: 3 };
    if (data[offset + 2] === 0 && data[offset + 3] === 1) return { offset, length: 4 };
  }

  return null;
}

function inspectVideoPes(
  pesPackets: PesPacket[],
  codec: 'h264' | 'hevc'
): { packets: MediaPacket[]; codecExtraData: string } {
  const mediaPackets: MediaPacket[] = [];
  const parameterSets: Set<string> = new Set();

  for (const pes of pesPackets) {
    let key: boolean = false;
    let current: { offset: number; length: number } | null = findNalStart(pes.data, 0);

    while (current) {
      const nalOffset: number = current.offset + current.length;
      const next: { offset: number; length: number } | null = findNalStart(pes.data, nalOffset);
      const nalEnd: number = next?.offset ?? pes.data.length;

      if (nalOffset < nalEnd) {
        const nalType: number = codec === 'h264'
          ? pes.data[nalOffset] & 0x1f
          : (pes.data[nalOffset] >> 1) & 0x3f;
        const isKey: boolean = codec === 'h264' ? nalType === 5 : nalType >= 16 && nalType <= 21;
        const isParameterSet: boolean = codec === 'h264'
          ? nalType === 7 || nalType === 8
          : nalType === 32 || nalType === 33 || nalType === 34;

        key ||= isKey;
        if (isParameterSet) parameterSets.add(pes.data.subarray(nalOffset, nalEnd).toString('hex'));
      }

      current = next;
    }

    if (pes.pts !== null || pes.dts !== null) {
      mediaPackets.push({ pts: pes.pts, dts: pes.dts, duration: null, key });
    }
  }

  return {
    packets: mediaPackets,
    codecExtraData: [...parameterSets].join('|')
  };
}

function getChannelLayout(channelConfig: number): string {
  switch (channelConfig) {
    case 1: return 'mono';
    case 2: return 'stereo';
    case 3: return '2.1';
    case 4: return '4.0';
    case 5: return '5.0';
    case 6: return '5.1';
    case 7: return '7.1';
    default: return `${ Math.max(1, channelConfig) }c`;
  }
}

function inspectAudioPes(pesPackets: PesPacket[]): AudioInspection {
  const packets: MediaPacket[] = [];
  const configurations: Set<string> = new Set();
  let format: AudioFormat | null = null;

  for (const pes of pesPackets) {
    let offset: number = 0;
    let frameIndex: number = 0;

    while (offset + 7 <= pes.data.length) {
      if (pes.data[offset] !== 0xff || (pes.data[offset + 1] & 0xf6) !== 0xf0) {
        offset++;
        continue;
      }

      const sampleRateIndex: number = (pes.data[offset + 2] >> 2) & 0x0f;
      const sampleRate: number | undefined = AAC_SAMPLE_RATES[sampleRateIndex];
      const channelConfig: number = ((pes.data[offset + 2] & 0x01) << 2)
        | ((pes.data[offset + 3] >> 6) & 0x03);
      const frameLength: number = ((pes.data[offset + 3] & 0x03) << 11)
        | (pes.data[offset + 4] << 3)
        | ((pes.data[offset + 5] >> 5) & 0x07);

      if (!sampleRate || frameLength < 7 || offset + frameLength > pes.data.length) {
        offset++;
        continue;
      }

      const audioObjectType: number = ((pes.data[offset + 2] >> 6) & 0x03) + 1;
      const rawBlocks: number = pes.data[offset + 6] & 0x03;
      const duration: number = 1024 * (rawBlocks + 1) / sampleRate;
      const pts: number | null = pes.pts === null ? null : pes.pts + (frameIndex * duration);
      const channelLayout: string = getChannelLayout(channelConfig);
      const extraData: string = Buffer.from([
        (audioObjectType << 3) | (sampleRateIndex >> 1),
        ((sampleRateIndex & 1) << 7) | (channelConfig << 3)
      ]).toString('hex');

      format ??= { sampleRate: String(sampleRate), channelLayout };
      configurations.add(`${ audioObjectType }:${ sampleRate }:${ channelLayout }:${ extraData }`);

      if (pts !== null) packets.push({ pts, dts: pts, duration, key: true });

      frameIndex++;
      offset += frameLength;
    }
  }

  return {
    packets,
    format,
    codecSignature: `aac:${ [...configurations].join('|') }`,
    codecExtraData: [...configurations].join('|')
  };
}

function createTimeline(
  packets: MediaPacket[],
  codecSignature: string,
  codecExtraData: string
): StreamTimeline | null {
  if (packets.length === 0) return null;

  const ptsValues: number[] = packets
    .map((packet: MediaPacket): number | null => packet.pts)
    .filter((value: number | null): value is number => value !== null);
  const dtsValues: number[] = packets
    .map((packet: MediaPacket): number | null => packet.dts)
    .filter((value: number | null): value is number => value !== null);
  const orderingValues: number[] = dtsValues.length > 1 ? dtsValues : ptsValues;
  const steps: number[] = [];

  for (let index: number = 1; index < orderingValues.length; index++) {
    const step: number = orderingValues[index] - orderingValues[index - 1];

    if (step > 0) steps.push(step);
  }

  const packetStep: number | null = median(steps);
  const starts: number[] = [];
  const ends: number[] = [];

  for (const packet of packets) {
    const start: number | null = packet.pts ?? packet.dts;

    if (start === null) continue;

    starts.push(start);
    ends.push(start + (packet.duration ?? packetStep ?? 0));
  }

  return {
    firstPts: ptsValues[0] ?? null,
    lastPts: ptsValues.at(-1) ?? null,
    firstDts: dtsValues[0] ?? null,
    lastDts: dtsValues.at(-1) ?? null,
    lastDuration: packets.at(-1)?.duration ?? packetStep,
    packetStep,
    startTime: starts.length > 0 ? Math.min(...starts) : null,
    endTime: ends.length > 0 ? Math.max(...ends) : null,
    firstPacketIsKey: packets[0].key,
    codecSignature,
    codecExtraData
  };
}

/** 在当前Worker内解析一个MPEG-TS分片，避免为每个分片启动ffprobe进程。 */
export function inspectTsSegment(data: Buffer): SegmentProbeResult {
  const packetOffset: number = findPacketOffset(data);
  const streams: StreamDefinition[] = discoverStreams(data, packetOffset);
  const videoStream: StreamDefinition | undefined = streams.find(
    (stream: StreamDefinition): boolean => stream.kind === 'video'
  );
  const audioStream: StreamDefinition | undefined = streams.find(
    (stream: StreamDefinition): boolean => stream.kind === 'audio'
  );
  const pesPackets: Map<number, PesPacket[]> = collectPesPackets(data, packetOffset, streams);
  const videoInspection: { packets: MediaPacket[]; codecExtraData: string } | null = videoStream
    ? inspectVideoPes(pesPackets.get(videoStream.pid) ?? [], videoStream.codec as 'h264' | 'hevc')
    : null;
  const audioInspection: AudioInspection | null = audioStream
    ? inspectAudioPes(pesPackets.get(audioStream.pid) ?? [])
    : null;
  const videoPesPackets: PesPacket[] = videoStream ? pesPackets.get(videoStream.pid) ?? [] : [];
  const audioPesPackets: PesPacket[] = audioStream ? pesPackets.get(audioStream.pid) ?? [] : [];

  if (videoPesPackets.length > 0 && videoInspection?.packets.length === 0) {
    throw new Error('无法在进程内解析视频PES时间线。');
  }

  if (audioPesPackets.length > 0 && audioInspection?.packets.length === 0) {
    throw new Error('无法在进程内解析AAC音频帧。');
  }

  const timeline: SegmentTimeline = {
    video: videoInspection && videoStream
      ? createTimeline(videoInspection.packets, videoStream.codec, videoInspection.codecExtraData)
      : null,
    audio: audioInspection
      ? createTimeline(
        audioInspection.packets,
        audioInspection.codecSignature,
        audioInspection.codecExtraData
      )
      : null
  };

  if (!timeline.video && !timeline.audio) {
    throw new Error('TS分片中没有可识别的音视频时间线。');
  }

  return {
    timeline,
    audioFormat: timeline.audio ? audioInspection?.format ?? null : null
  };
}
