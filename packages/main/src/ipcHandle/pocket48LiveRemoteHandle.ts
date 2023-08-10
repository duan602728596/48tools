import { ipcMain, type IpcMainInvokeEvent, type BrowserWindow } from 'electron';
import { Pocket48LiveMain, pocket48LiveMap, type Pocket48LiveArgs } from '../pocket48Live/Pocket48LiveMain';
import { Pocket48LiveRemoteHandleChannel } from '../channelEnum';

/* 开启子线程 */
function pocket48LiveRemoteHandle(win: BrowserWindow): void {
  // 开始下载
  ipcMain.handle(Pocket48LiveRemoteHandleChannel.Pocket48LiveStart, function(event: IpcMainInvokeEvent, args: string): void {
    const argsObject: Pocket48LiveArgs = JSON.parse(args);

    pocket48LiveMap.set(argsObject.id, new Pocket48LiveMain(argsObject, win));
  });

  // 手动kill
  ipcMain.handle(Pocket48LiveRemoteHandleChannel.Pocket48LiveKill, function(event: IpcMainInvokeEvent, id: string): void {
    pocket48LiveMap.get(id)?.kill?.();
  });
}

export default pocket48LiveRemoteHandle;