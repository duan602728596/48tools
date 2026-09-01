import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import * as fs from 'node:fs';
import { promises as fsP, type Stats } from 'node:fs';
import * as path from 'node:path';
import { pipeline } from 'node:stream/promises';
// @ts-expect-error
import got from 'got';
import type GotRequest from 'got/dist/source/core';
import {
  createGroupConcatFile,
  isSourceBoundary,
  parseMediaPlaylist,
  type HlsSegment,
  type SegmentTimeline,
  type StreamTimeline
} from './timeline';

export type WorkerEventData = {
  ffmpeg: string;
  type: 'start' | 'stop';
  playStreamPath: string;
  filePath: string;
  qid?: string;
};

type ProbePacket = {
  stream_index: number;
  pts_time?: string;
  dts_time?: string;
  duration_time?: string;
  flags?: string;
};

type ProbeStream = {
  index: number;
  codec_type?: string;
  codec_name?: string;
  profile?: string;
  codec_tag_string?: string;
  width?: number;
  height?: number;
  pix_fmt?: string;
  level?: number;
  sample_fmt?: string;
  sample_rate?: string;
  channels?: number;
  channel_layout?: string;
  extradata?: string;
};

type ProbeResult = {
  packets?: ProbePacket[];
  streams?: ProbeStream[];
};

type ProbeFormatResult = {
  format?: {
    duration?: string;
  };
};

type DownloadPartsResult = {
  partFiles: string[];
  needsContinuousAudio: boolean;
};

let activeChild: ChildProcessWithoutNullStreams | null = null;
let activeRequest: GotRequest | null = null;
let activeTask: Promise<void> | null = null;
let isStopped: boolean = false;

function postProgress(qid: string | undefined, value: number): void {
  if (!qid) return;

  postMessage({
    type: 'progress',
    data: Math.min(100, Math.max(0, Number(value.toFixed(2)))),
    qid
  });
}

function getFFprobe(ffmpeg: string): string {
  const parsed: path.ParsedPath = path.parse(ffmpeg);
  const extension: string = parsed.ext.toLowerCase() === '.exe' ? '.exe' : '';

  if (/^ffmpeg(?:\.exe)?$/i.test(parsed.base)) {
    return path.join(parsed.dir, `ffprobe${ extension }`);
  }

  const replaced: string = ffmpeg.replace(/ffmpeg(?=\.exe$|$)/i, 'ffprobe');

  return replaced === ffmpeg ? path.join(parsed.dir, `ffprobe${ extension }`) : replaced;
}

function runProcessInternal(command: string, args: string[], captureStdout: boolean): Promise<string> {
  return new Promise((resolve: (value: string) => void, reject: (reason?: Error) => void): void => {
    const processChild: ChildProcessWithoutNullStreams = spawn(command, args);
    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];
    let settled: boolean = false;

    function rejectOnce(err: Error): void {
      if (settled) return;

      settled = true;
      reject(err);
    }

    activeChild = processChild;
    processChild.stdout.on('data', function(data: Buffer): void {
      if (captureStdout) stdout.push(data);
    });
    processChild.stderr.on('data', function(data: Buffer): void {
      stderr.push(data);
    });
    processChild.on('error', function(err: Error): void {
      if (activeChild === processChild) activeChild = null;
      rejectOnce(err);
    });
    processChild.on('close', function(code: number | null): void {
      if (activeChild === processChild) activeChild = null;
      if (settled) return;

      settled = true;
      if (code === 0) {
        resolve(captureStdout ? Buffer.concat(stdout).toString('utf8') : '');
      } else {
        const message: string = Buffer.concat(stderr).toString('utf8').trim();

        reject(new Error(message || `${ path.basename(command) }退出码：${ code ?? 'unknown' }`));
      }
    });
  });
}

function runProcess(command: string, args: string[]): Promise<void> {
  return runProcessInternal(command, args, false).then((): undefined => undefined);
}

function runProcessOutput(command: string, args: string[]): Promise<string> {
  return runProcessInternal(command, args, true);
}

function parseNumber(value: string | undefined): number | null {
  if (value === undefined) return null;

  const result: number = Number(value);

  return Number.isFinite(result) ? result : null;
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;

  const sorted: number[] = [...values].sort((a: number, b: number): number => a - b);
  const middle: number = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
}

function createStreamTimeline(stream: ProbeStream, packets: ProbePacket[]): StreamTimeline | null {
  if (packets.length === 0) return null;

  const ptsValues: number[] = packets
    .map((packet: ProbePacket): number | null => parseNumber(packet.pts_time))
    .filter((value: number | null): value is number => value !== null);
  const dtsValues: number[] = packets
    .map((packet: ProbePacket): number | null => parseNumber(packet.dts_time))
    .filter((value: number | null): value is number => value !== null);
  const orderingValues: number[] = dtsValues.length > 1 ? dtsValues : ptsValues;
  const steps: number[] = [];

  for (let index: number = 1; index < orderingValues.length; index++) {
    const step: number = orderingValues[index] - orderingValues[index - 1];

    if (step > 0) steps.push(step);
  }

  const packetStep: number | null = median(steps);
  const packetStarts: number[] = [];
  const packetEnds: number[] = [];

  for (const packet of packets) {
    const pts: number | null = parseNumber(packet.pts_time);
    const dts: number | null = parseNumber(packet.dts_time);
    const packetStart: number | null = pts ?? dts;

    if (packetStart === null) continue;

    packetStarts.push(packetStart);
    packetEnds.push(packetStart + (parseNumber(packet.duration_time) ?? packetStep ?? 0));
  }

  return {
    firstPts: ptsValues[0] ?? null,
    lastPts: ptsValues.at(-1) ?? null,
    firstDts: dtsValues[0] ?? null,
    lastDts: dtsValues.at(-1) ?? null,
    lastDuration: parseNumber(packets.at(-1)?.duration_time),
    packetStep,
    startTime: packetStarts.length > 0 ? Math.min(...packetStarts) : null,
    endTime: packetEnds.length > 0 ? Math.max(...packetEnds) : null,
    firstPacketIsKey: packets[0].flags?.includes('K') ?? false,
    codecSignature: JSON.stringify({
      codecName: stream.codec_name ?? '',
      profile: stream.profile ?? '',
      codecTag: stream.codec_tag_string ?? '',
      width: stream.width ?? null,
      height: stream.height ?? null,
      pixelFormat: stream.pix_fmt ?? '',
      level: stream.level ?? null,
      sampleFormat: stream.sample_fmt ?? '',
      sampleRate: stream.sample_rate ?? '',
      channels: stream.channels ?? null,
      channelLayout: stream.channel_layout ?? ''
    }),
    codecExtraData: stream.extradata?.replace(/\s/g, '') ?? ''
  };
}

async function probeTimeline(ffprobe: string, file: string): Promise<SegmentTimeline> {
  const output: string = await runProcessOutput(ffprobe, [
    '-v', 'error',
    '-show_packets',
    '-show_streams',
    '-show_data',
    '-show_entries',
    'packet=stream_index,pts_time,dts_time,duration_time,flags:'
      + 'stream=index,codec_type,codec_name,profile,codec_tag_string,width,height,pix_fmt,level,'
      + 'sample_fmt,sample_rate,channels,channel_layout,extradata',
    '-of', 'json',
    file
  ]);
  const result: ProbeResult = JSON.parse(output) as ProbeResult;
  const streams: ProbeStream[] = result.streams ?? [];
  const packets: ProbePacket[] = result.packets ?? [];
  const videoStream: ProbeStream | undefined = streams.find(
    (stream: ProbeStream): boolean => stream.codec_type === 'video'
  );
  const audioStream: ProbeStream | undefined = streams.find(
    (stream: ProbeStream): boolean => stream.codec_type === 'audio'
  );
  const timeline: SegmentTimeline = {
    video: videoStream
      ? createStreamTimeline(videoStream, packets.filter(
        (packet: ProbePacket): boolean => packet.stream_index === videoStream.index
      ))
      : null,
    audio: audioStream
      ? createStreamTimeline(audioStream, packets.filter(
        (packet: ProbePacket): boolean => packet.stream_index === audioStream.index
      ))
      : null
  };

  if (!timeline.video && !timeline.audio) {
    throw new Error(`媒体分片中没有可识别的音视频流：${ path.basename(file) }`);
  }

  return timeline;
}

async function downloadSegment(uri: string, file: string): Promise<void> {
  const url: URL = new URL(uri);
  const request: GotRequest = got.stream(uri, {
    headers: {
      'Host': url.hostname,
      'User-Agent': 'SNH48 ENGINE'
    }
  });

  activeRequest = request;
  try {
    await pipeline(request, fs.createWriteStream(file));
  } finally {
    activeRequest = null;
  }

  const fileStat: Stats = await fsP.stat(file);

  if (fileStat.size === 0) {
    throw new Error(`TS分片下载为空：${ uri }`);
  }
}

async function appendSegment(segmentFile: string, partFile: string, truncate: boolean): Promise<void> {
  await pipeline(
    fs.createReadStream(segmentFile),
    fs.createWriteStream(partFile, { flags: truncate ? 'w' : 'a' })
  );
}

function getPartFile(filePath: string, partIndex: number): string {
  if (partIndex === 0) return filePath;

  const parsed: path.ParsedPath = path.parse(filePath);
  const suffix: string = String(partIndex + 1).padStart(3, '0');

  return path.join(parsed.dir, `${ parsed.name }_${ suffix }${ parsed.ext }`);
}

async function downloadParts(
  ffprobe: string,
  workDir: string,
  filePath: string,
  segments: HlsSegment[],
  qid?: string
): Promise<DownloadPartsResult> {
  const partFiles: string[] = [];
  const segmentFile: string = path.join(workDir, '_current_segment.ts');
  let previousTimeline: SegmentTimeline | null = null;
  let hasAudio: boolean = false;
  let hasVideoWithoutAudio: boolean = false;

  for (let index: number = 0; index < segments.length; index++) {
    if (isStopped) break;

    const segment: HlsSegment = segments[index];

    try {
      await downloadSegment(segment.uri, segmentFile);
      if (isStopped) break;

      const timeline: SegmentTimeline = await probeTimeline(ffprobe, segmentFile);
      const startsNewPart: boolean = previousTimeline === null
        || isSourceBoundary(segment, previousTimeline, timeline);

      hasAudio ||= timeline.audio !== null;
      hasVideoWithoutAudio ||= timeline.video !== null && timeline.audio === null;

      if (startsNewPart) {
        partFiles.push(getPartFile(filePath, partFiles.length));
      }

      await appendSegment(segmentFile, partFiles.at(-1) as string, startsNewPart);
      previousTimeline = timeline;
      postProgress(qid, (index + 1) / segments.length * 90);
    } finally {
      await fsP.rm(segmentFile, { force: true });
    }
  }

  return {
    partFiles,
    needsContinuousAudio: hasAudio && hasVideoWithoutAudio
  };
}

async function probeDuration(ffprobe: string, file: string): Promise<number> {
  const output: string = await runProcessOutput(ffprobe, [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'json',
    file
  ]);
  const result: ProbeFormatResult = JSON.parse(output) as ProbeFormatResult;
  const duration: number | null = parseNumber(result.format?.duration);

  if (duration === null || duration <= 0) {
    throw new Error(`无法获取分段视频时长：${ path.basename(file) }`);
  }

  return duration;
}

async function normalizeParts(
  ffmpeg: string,
  ffprobe: string,
  workDir: string,
  partFiles: string[],
  qid?: string
): Promise<Array<{ filename: string; duration: number }>> {
  const result: Array<{ filename: string; duration: number }> = [];

  for (let index: number = 0; index < partFiles.length; index++) {
    if (isStopped) return result;

    const outputFilename: string = `_normalized_${ String(index).padStart(4, '0') }.ts`;
    const outputFile: string = path.join(workDir, outputFilename);

    await runProcess(ffmpeg, [
      '-y',
      '-v', 'error',
      '-copyts',
      '-start_at_zero',
      '-i', partFiles[index],
      '-map', '0:v:0?',
      '-map', '0:a:0?',
      '-c', 'copy',
      '-muxpreload', '0',
      '-muxdelay', '0',
      outputFile
    ]);

    result.push({ filename: outputFilename, duration: await probeDuration(ffprobe, outputFile) });
    postProgress(qid, 90 + (((index + 1) / partFiles.length) * 8));
  }

  return result;
}

async function createVideo(workerData: WorkerEventData, partsDir: string): Promise<void> {
  const { ffmpeg, playStreamPath, filePath, qid }: WorkerEventData = workerData;
  const playlistData: string = await fsP.readFile(playStreamPath, { encoding: 'utf8' });
  const segments: HlsSegment[] = parseMediaPlaylist(playlistData);

  if (segments.length === 0) {
    throw new Error('m3u8中没有可下载的TS分片。');
  }

  const ffprobe: string = getFFprobe(ffmpeg);
  const downloadResult: DownloadPartsResult = await downloadParts(
    ffprobe,
    partsDir,
    filePath,
    segments,
    qid
  );
  const { partFiles, needsContinuousAudio }: DownloadPartsResult = downloadResult;

  if (isStopped) return;
  if (partFiles.length === 0) throw new Error('没有已完成的TS分段。');

  if (partFiles.length === 1) {
    postProgress(qid, 100);

    return;
  }

  const groupFiles: Array<{ filename: string; duration: number }> = await normalizeParts(
    ffmpeg,
    ffprobe,
    partsDir,
    partFiles,
    qid
  );

  if (isStopped) return;

  const concatFile: string = path.join(partsDir, '_sources.ffconcat');
  const mergedFile: string = path.join(partsDir, '_merged.ts');
  const concatOutputFile: string = needsContinuousAudio
    ? path.join(partsDir, '_merged_sparse_audio.ts')
    : mergedFile;

  await fsP.writeFile(concatFile, createGroupConcatFile(groupFiles), { encoding: 'utf8' });
  postProgress(qid, 99);
  await runProcess(ffmpeg, [
    '-y',
    '-v', 'error',
    '-f', 'concat',
    '-safe', '0',
    '-i', concatFile,
    '-map', '0:v:0?',
    '-map', '0:a:0?',
    '-c', 'copy',
    '-muxpreload', '0',
    '-muxdelay', '0',
    concatOutputFile
  ]);

  if (needsContinuousAudio) {
    await runProcess(ffmpeg, [
      '-y',
      '-v', 'error',
      '-copyts',
      '-start_at_zero',
      '-i', concatOutputFile,
      '-map', '0:v:0?',
      '-map', '0:a:0',
      '-c:v', 'copy',
      '-af', 'aresample=async=1:first_pts=0,apad',
      '-c:a', 'aac',
      '-b:a', '64k',
      '-shortest',
      '-muxpreload', '0',
      '-muxdelay', '0',
      mergedFile
    ]);
  }

  await fsP.rename(mergedFile, filePath);

  for (const partFile of partFiles.slice(1)) {
    try {
      await fsP.rm(partFile, { force: true });
    } catch { /**/ }
  }

  postProgress(qid, 100);
}

function normalizeError(err: unknown): Error {
  return err instanceof Error ? err : new Error(String(err));
}

async function run(workerData: WorkerEventData): Promise<void> {
  let partsDir: string | null = null;
  let caughtError: Error | null = null;

  isStopped = false;
  try {
    partsDir = await fsP.mkdtemp(`${ workerData.filePath }.parts-`);
    await createVideo(workerData, partsDir);
  } catch (err) {
    caughtError = normalizeError(err);
  }

  if (partsDir) {
    try {
      await fsP.rm(partsDir, { force: true, recursive: true });
    } catch { /**/ }
  }

  if (isStopped) {
    postMessage({ type: 'close', qid: workerData.qid });
  } else if (caughtError) {
    postMessage({ type: 'error', error: caughtError });
  } else {
    postMessage({ type: 'close', qid: workerData.qid });
  }
}

function stop(): void {
  isStopped = true;
  try {
    activeRequest?.destroy();
  } catch { /**/ }
  activeRequest = null;
  activeChild?.kill('SIGTERM');
}

addEventListener('message', function(event: MessageEvent<WorkerEventData>): void {
  switch (event.data.type) {
    case 'start':
      if (!activeTask) {
        activeTask = run(event.data).finally(function(): void {
          activeTask = null;
        });
      }
      break;

    case 'stop':
      stop();
      break;
  }
});
