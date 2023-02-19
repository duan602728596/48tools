import './Accessibility.global.sass';

export const accessibilityClassName: string = 'accessibility';
let inAccessibilityStatus: boolean = false; // 当前是否进入无障碍状态

// 鼠标监听事件
function handleAccessibilityMousedown(event: MouseEvent): void {
  if (event.isTrusted) {
    inAccessibilityStatus = false;
    document.body.classList.remove(accessibilityClassName);
    document.removeEventListener('mousedown', handleAccessibilityMousedown);
  }
}

// 键盘监听事件
function handleAccessibilityKeydown(event: KeyboardEvent): void {
  // Tab键事件
  if (!inAccessibilityStatus && event.code === 'Tab') {
    inAccessibilityStatus = true;
    document.body.classList.add(accessibilityClassName);
    document.addEventListener('mousedown', handleAccessibilityMousedown);
  }

  // 回车键事件
  if (inAccessibilityStatus && event.code === 'Enter' && document.activeElement !== document.body) {
    if (document.activeElement) {
      const tabIndex: string | null = document.activeElement.getAttribute('tabindex');

      if (!(tabIndex === undefined || tabIndex === null)) {
        document.activeElement['click']();
      }
    }
  }
}

document.addEventListener('keydown', handleAccessibilityKeydown);