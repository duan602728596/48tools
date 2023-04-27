/* 执行ffmpeg的命令 */
interface UtilObject {
  ffmpeg: string;
  input: string | Array<string>;
  output: string;
  cmd: Array<string>;
  stdout: string;
}

export type _UtilObject = UtilObject;

export function utilLogTemplate(type: string, fn: string, data: string): string {
  const json: UtilObject = JSON.parse(data);
  let input: string = 'input: ';

  if (Array.isArray(json.input)) {
    input += json.input.map((item: string, index: number): string => {
      return ' '.repeat(index === 0 ? 0 : 10) + item;
    }).join('\n');
  } else {
    input += json.input;
  }

  const args: string = json.cmd.map((item: string, index: number): string => {
    const str: string = item.replace(/\r/g, '\\r')
      .replace(/\n/g, '\\n');

    return ' '.repeat(index === 0 ? 0 : 10) + str;
  }).join('\n');

  return `
   title: 执行ffmpeg命令
    type: ${ type }
function: ${ fn }
   input: ${ json.input }
  output: ${ json.output }
  ffmpeg: ${ json.ffmpeg }
    args: ${ args }


${ json.stdout }
`;
}