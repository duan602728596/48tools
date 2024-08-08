const ffmpegDownloadUrlObject: Record<'default' | 'win' | 'mac', `https://${ string }`> = {
  default: 'https://www.ffmpeg.org/download.html',
  win: 'https://www.gyan.dev/ffmpeg/builds/',
  mac: 'https://evermeet.cx/ffmpeg/'
};
let ffmpegDownloadUrl: string = ffmpegDownloadUrlObject.default;

/* 根据UA获取系统的类型 */
function setFFmpegDownloadUrl(): void {
  const userAgent: string = navigator.userAgent.toLowerCase();

  if (userAgent.includes('win')) {
    ffmpegDownloadUrl = ffmpegDownloadUrlObject.win;
  } else if (userAgent.includes('mac')) {
    ffmpegDownloadUrl = ffmpegDownloadUrlObject.mac;
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