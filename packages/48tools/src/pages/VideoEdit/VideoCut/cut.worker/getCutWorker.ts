export default function(): Worker {
  return new Worker(new URL('./cut.worker.ts', import.meta.url));
}