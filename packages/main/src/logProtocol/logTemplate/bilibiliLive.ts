/* 获取直播间的直播地址 */
interface PlayUrlObject {
  readonly roomId: string;
  readonly response: string;
}

export type _PlayUrlObject = PlayUrlObject;

export function playUrlLogTemplate(type: string, fn: string, data: string): string {
  const json: PlayUrlObject = JSON.parse(data);

  return `
   title: 获取直播间的直播地址
    type: ${ type }
function: ${ fn }
  roomId: ${ json.roomId }


${ json.response }
`;
}