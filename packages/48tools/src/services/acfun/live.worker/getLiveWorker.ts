export default function(): Worker {
  return new Worker(new URL('./live.worker.ts', import.meta.url));
}