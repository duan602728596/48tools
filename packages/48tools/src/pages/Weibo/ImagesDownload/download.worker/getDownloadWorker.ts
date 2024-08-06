export default function(): Worker {
  return new Worker(new URL('./download.worker.ts', import.meta.url));
}