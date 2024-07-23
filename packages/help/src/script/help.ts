const url: URL = new URL(window.location.href);
const params: URLSearchParams = url.searchParams;
const navId: string | null = params.get('nav_id') ?? null;

const iframe: HTMLIFrameElement | null = document.getElementById('help-iframe') as HTMLIFrameElement;
const HelpNavLinks: NodeListOf<HTMLAnchorElement> = document.querySelectorAll('.help-nav-link');

/* 初始化时设置当前的pageId */
function initPageId(): void {
  if (navId && iframe) {
    const targetNav: HTMLElement | null = document.getElementById(navId);

    if (targetNav) {
      const href: string | null = targetNav.getAttribute('href');

      if (href) iframe.setAttribute('src', href);
    }
  }
}

/* 点击后设置 */
function handleHelpNavLinkClick(event: Event): void {
  event.preventDefault();
  const target: HTMLAnchorElement = event.target as HTMLAnchorElement;
  const href: string | null = target.getAttribute('href');

  if (href && iframe) iframe.setAttribute('src', href);
}

/* 初始化执行 */
initPageId();

for (const helpNavLink of HelpNavLinks) {
  helpNavLink.addEventListener('click', handleHelpNavLinkClick);
}