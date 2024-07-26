let ffmpegDownloadUrl: string = 'https://www.ffmpeg.org/download.html';

/* 根据UA获取系统的类型 */
function setFFmpegDownloadUrl(): void {
  const userAgent: string = navigator.userAgent.toLowerCase();

  if (userAgent.includes('win')) {
    ffmpegDownloadUrl = 'https://www.gyan.dev/ffmpeg/builds/';
  } else if (userAgent.includes('mac')) {
    ffmpegDownloadUrl = 'https://evermeet.cx/ffmpeg/';
  }
}

/**
 * 点击ffmpeg下载按钮
 * @param { MouseEvent } event
 */
function handleFFmpegDownloadPageClick(event: MouseEvent): void {
  window.open(ffmpegDownloadUrl, '_blank');
}

/* 获取当前的系统，进入不同版本的ffmpeg下载页 */
function ffmpegDownload(): void {
  setFFmpegDownloadUrl();

  const ffmpegDownloadBtn: HTMLElement | null = document.getElementById('ffmpeg-download-btn');

  if (!ffmpegDownloadBtn) return;

  ffmpegDownloadBtn.addEventListener('click', handleFFmpegDownloadPageClick);
}

export default ffmpegDownload;