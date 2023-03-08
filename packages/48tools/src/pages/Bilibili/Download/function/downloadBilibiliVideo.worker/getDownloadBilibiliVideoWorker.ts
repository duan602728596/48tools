export default function(): Worker {
  return new Worker(new URL('./downloadBilibiliVideo.worker.ts', import.meta.url));
}