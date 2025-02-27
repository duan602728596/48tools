export default function(): Worker {
  return new Worker(new URL('./Pocket48LiveDownload.worker.ts', import.meta.url));
}