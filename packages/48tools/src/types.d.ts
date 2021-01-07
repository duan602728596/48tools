// webworker进程
export interface WebWorkerChildItem {
  id: string;
  worker: Worker;
}

// worker进程发出的数据
export type MessageEventData = {
  type: 'close' | 'error';
  error?: Error;
};