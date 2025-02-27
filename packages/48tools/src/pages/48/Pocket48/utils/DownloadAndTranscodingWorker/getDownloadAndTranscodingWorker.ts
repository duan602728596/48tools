export default function(): Worker {
  return new Worker(new URL('./DownloadAndTranscoding.worker.ts', import.meta.url));
}