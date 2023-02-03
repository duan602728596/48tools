/* ========== Concat ========== */
export interface ConcatItem {
  id: string;
  value: string;
  filename: string;
}

/* ========== VideoCut ========== */
export interface CutItem {
  id: string;
  file: string;       // 文件位置
  name: string;       // 文件名称
  startTime?: string; // 开始时间
  endTime?: string;   // 结束时间
}

/* ========== FFmpegProcess ========== */
export interface ProcessItemConsole {
  text: string;
  key: string;
}

export interface ProcessItem {
  id: string;
  args: string;
  status: 'running' | 'stop' | 'error';
  console: Array<ProcessItemConsole>;
  worker: Worker;
}

/* 数据库 */
export interface dbTemplateItem {
  id: string;
  name: string;
  args: string;
}