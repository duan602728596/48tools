/* 高亮选中的url */
const navList: HTMLElement | null = document.getElementById('nav-list');

if (navList) {
  const urlSplit: Array<string> = window.location.href.split(/[\\/]+/)
    .filter((s: string): boolean => s !== '');
  const end: string | undefined = urlSplit.at(-1);
  let name: string = 'index';

  if (end && /\.html$/i.test(end)) {
    name = end.replace(/\.html$/i, '').toLowerCase();
  }

  const targetLink: HTMLElement | null = navList.querySelector(`[data-url-id="${ name }"]`);

  if (targetLink) {
    targetLink.classList.add('text-primary', 'fw-bold');
  }
}