export default function(): Worker {
  return new Worker(new URL('./RecordVideoDownload.worker.ts', import.meta.url));
}