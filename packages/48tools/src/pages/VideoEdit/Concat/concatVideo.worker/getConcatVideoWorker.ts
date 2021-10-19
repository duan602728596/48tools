export default function(): Worker {
  return new Worker(new URL('./concatVideo.worker.ts', import.meta.url));
}