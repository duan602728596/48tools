/**
 * 生成测试的title
 * @param { number } serialNumber - 编号
 * @param { string } title - 标题
 */
export function testTitle(serialNumber: number, title: string): string {
  return `[${ serialNumber }]${ title }`;
}

/**
 * 输出log
 * @param { number } serialNumber - 编号
 * @param { string } title - 标题
 */
export function testLog(serialNumber: number, title: string): void {
  console.log(testTitle(serialNumber, title));
}

/**
 * 生成vp测试的图片
 * @param { string } dir - 目录
 * @param { string } filename - 文件名
 * @param { boolean } [dark] - 暗黑模式文件
 */
export function vpImage(dir: string, filename: string, dark?: boolean): Array<string> {
  return [dir, `${ filename }${ dark ? '-dark' : '' }.png`];
}