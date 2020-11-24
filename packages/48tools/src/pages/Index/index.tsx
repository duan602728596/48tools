import { ipcRenderer, shell } from 'electron';
import type { ReactElement, MouseEvent } from 'react';
import style from './index.sass';

/* 首页 */
function Index(props: {}): ReactElement {
  // 打开开发者工具
  function handleOpenDeveloperToolsClick(event: MouseEvent): void {
    ipcRenderer.send('developer-tools');
  }

  // 打开使用说明
  function handleOpenHelpClick(event: MouseEvent): void {
    shell.openExternal('https://github.com/duan602728596/qqtools/blob/next/README.md');
  }

  return (
    <div className={ style.main }></div>
  );
}

export default Index;