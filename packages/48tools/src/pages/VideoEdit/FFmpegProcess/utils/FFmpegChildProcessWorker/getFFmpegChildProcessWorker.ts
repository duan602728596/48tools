export default function(): Worker {
  return new Worker(new URL('./FFmpegChildProcess.worker.ts', import.meta.url));
}