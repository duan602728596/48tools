export default function(): Worker {
  return new Worker(new URL('./live48.worker.ts', import.meta.url));
}