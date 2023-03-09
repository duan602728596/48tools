/**
 * 生成测试的title
 * @param { number } serialNumber: 编号
 * @param { string } title: 标题
 */
export function testTitle(serialNumber: number, title: string): string {
  return `[${ serialNumber }]${ title }`;
}

/**
 * 输出log
 * @param { number } serialNumber: 编号
 * @param { string } title: 标题
 */
export function testLog(serialNumber: number, title: string): void {
  console.log(testTitle(serialNumber, title));
}