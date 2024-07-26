/* 高亮选中的url */
function selectedUrl(): void {
  const navList: HTMLElement | null = document.getElementById('nav-list');

  if (!navList) return;

  // 解析html路径中的文件名
  const urlSplit: Array<string> = window.location.href.split(/[\\/]+/)
    .filter((s: string): boolean => s !== '');
  const urlSplitEnd: string | undefined = urlSplit.at(-1);
  let name: string = 'index';

  if (urlSplitEnd && /\.html$/i.test(urlSplitEnd)) {
    name = urlSplitEnd.replace(/\.html$/i, '').toLowerCase();
  }

  // 高亮
  const targetLink: HTMLElement | null = navList.querySelector(`[data-url-id="${ name }"]`);

  if (!targetLink) return;

  targetLink.classList.add('text-primary', 'fw-bold');
}

export default selectedUrl;