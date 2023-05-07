export default function(): Worker {
  return new Worker(new URL('./FFmpegDownload.worker.ts', import.meta.url));
}