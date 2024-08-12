/**
 * 记录ImportSpecifier
 * [0] - 模块名
 * [1] - 别名
 */
export type ImportSpecifierItem = [string, string | undefined];

interface ImportInfoArgsObject {
  prefixVariableName: string;
  moduleName: string;
  exportDefault?: boolean;
}

/* 记录加载信息 */
export class ImportInfo {
  variableName: Array<string> = [];
  specifier: Array<ImportSpecifierItem> = [];

  prefixVariableName: string;
  moduleName: string;
  exportDefault?: boolean;

  /**
   * 将模块名转换成变量名
   * @param { string } moduleName
   */
  static moduleNameToVariableName(moduleName: string): string {
    return moduleName.replace(/[@\-\/:]/g, '_');
  }

  /**
   * @param { string } prefixVariableName - 变量名前缀
   * @param { string } moduleName - 模块名
   * @param { boolean } [exportDefault] - 是否导出了default
   */
  constructor({ prefixVariableName, moduleName, exportDefault }: ImportInfoArgsObject) {
    this.prefixVariableName = prefixVariableName;
    this.moduleName = moduleName;
    this.exportDefault = exportDefault;
  }

  /* 返回格式化的变量名 */
  get formatVariableName(): string {
    return `${ this.prefixVariableName }${ ImportInfo.moduleNameToVariableName(this.moduleName) }`;
  }
}