/* 获取当前的系统，进入不同版本的ffmpeg下载页 */
const ffmpegDownloadBtn: HTMLElement | null = document.getElementById('ffmpeg-download-btn');
const userAgent: string = navigator.userAgent.toLowerCase();
let ffmpegDownloadUrl: string = 'https://www.ffmpeg.org/download.html';

if (userAgent.includes('win')) {
  ffmpegDownloadUrl = 'https://www.gyan.dev/ffmpeg/builds/';
} else if (userAgent.includes('mac')) {
  ffmpegDownloadUrl = 'https://evermeet.cx/ffmpeg/';
}

function handleFFmpegDownloadPageClick(event: MouseEvent): void {
  window.open(ffmpegDownloadUrl, '_blank');
}

if (ffmpegDownloadBtn) {
  ffmpegDownloadBtn.addEventListener('click', handleFFmpegDownloadPageClick);
}