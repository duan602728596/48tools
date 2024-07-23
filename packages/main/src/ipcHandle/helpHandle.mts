import path from 'node:path';
import { shell, ipcMain, type IpcMainInvokeEvent } from 'electron';
import { HelpChannel } from '../channelEnum.js';
import { helpDir } from '../utils.mjs';

interface HelpArgs {
  navId?: string;
}

/* 打开帮助文件 */
function helpHandle(): void {
  ipcMain.handle(HelpChannel.Help, function(event: IpcMainInvokeEvent, args?: HelpArgs): void {
    const { navId = 'index' }: HelpArgs = args ?? {};

    shell.openPath(path.join(helpDir, `${ navId }.html`));
  });
}

export default helpHandle;