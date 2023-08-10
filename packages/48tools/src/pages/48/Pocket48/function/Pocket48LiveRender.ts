import { ipcRenderer, type IpcRendererEvent } from 'electron';
import { Pocket48LiveRemoteHandleChannel } from '@48tools/main/src/channelEnum';
import type { _UtilObject } from '@48tools/main/src/logProtocol/logTemplate/ffmpeg';
import { _ffmpegLogProtocol } from '../../../../utils/logProtocol/logActions';

export interface Pocket48LiveArgs {
  readonly id: string;
  readonly liveId: string;
  readonly roomId: string;
  readonly playStreamPath: string;
  readonly filePath: string;
  readonly ffmpeg: string;
  onClose: (id: string) => (void | Promise<void>);
}

class Pocket48LiveRender {
  id: string;
  liveId: string;
  roomId: string;
  playStreamPath: string;
  filePath: string;
  ffmpeg: string;
  onClose: (id: string) => (void | Promise<void>);

  constructor(args: Pocket48LiveArgs) {
    this.id = args.id;
    this.liveId = args.liveId;
    this.roomId = args.roomId;
    this.playStreamPath = args.playStreamPath;
    this.filePath = args.filePath;
    this.ffmpeg = args.ffmpeg;
    this.onClose = args.onClose;

    ipcRenderer.once(`${ Pocket48LiveRemoteHandleChannel.Pocket48LiveClose }${ this.id }`, this.handleIpcMessage);
    ipcRenderer.invoke(Pocket48LiveRemoteHandleChannel.Pocket48LiveStart, JSON.stringify({
      id: this.id,
      liveId: this.liveId,
      roomId: this.roomId,
      playStreamPath: this.playStreamPath,
      filePath: this.filePath,
      ffmpeg: this.ffmpeg
    }));
  }

  handleIpcMessage: (event: IpcRendererEvent, args: string) => void = (event: IpcRendererEvent, args: string): void => {
    const argsObject: {
      id: string;
      log: {
        ffmpeg: string;
        input: string;
        output: string;
        cmd: Array<string>;
        stdout: string;
      } | null;
    } = JSON.parse(args);

    argsObject.log && _ffmpegLogProtocol.post<_UtilObject>('mainThread', argsObject.log);
    this.onClose(this.id);
  };

  kill(): void {
    ipcRenderer.invoke(Pocket48LiveRemoteHandleChannel.Pocket48LiveKill, this.id);
  }
}

export default Pocket48LiveRender;