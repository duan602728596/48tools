import type { DefaultOptionType } from 'rc-select/es/Select';

export interface TplItem {
  id: string;
  label: string;
  value: string;
}

export type TplOption = { item: TplItem } & DefaultOptionType;

enum Text {
  Input = '视频地址',
  Out = '视频保存路径'
}

export const template: Array<TplItem> = [
  {
    id: 'default-0',
    label: '视频下载',
    value: ['-i', Text.Input, '-c', 'copy', Text.Out].join('  ')
  },
  {
    id: 'default-1',
    label: '视频下载并转码到MP4',
    value: ['-i', Text.Input, '-vcodec', 'libx264', Text.Out].join('  ')
  },
  {
    id: 'default-3',
    label: '视频下载并转码到MP4（二）',
    value: ['-i', Text.Input, '-c:v', 'h264', '-c:a', 'aac', Text.Out].join('  ')
  },
  {
    id: 'default-2',
    label: 'M3U8视频格式下载',
    value: ['-protocol_whitelist', '"file,http,https,tcp,tls"', '-i', Text.Input, '-c', 'copy', Text.Out].join('  ')
  }
];

export const templateSelectOptions: Array<TplOption> = template.map((o: TplItem): TplOption => ({
  label: o.label,
  value: o.id,
  item: o
}));