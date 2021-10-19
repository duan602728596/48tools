export default function(): Worker {
  return new Worker(new URL('./FFMpegDownload.worker.ts', import.meta.url));
}