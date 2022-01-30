/**
 * 文件下载
 * @param { Blob } blob: 文件地址
 * @param { string } downloadName: 文件名
 */
function download(blob: Blob, downloadName: string): void {
  let link: HTMLAnchorElement | undefined = document.createElement('a');
  const objectUrl: string = URL.createObjectURL(blob);

  link.href = objectUrl;
  link.download = downloadName;

  link.click();
  link = undefined;
  URL.revokeObjectURL(objectUrl);
}

export default download;