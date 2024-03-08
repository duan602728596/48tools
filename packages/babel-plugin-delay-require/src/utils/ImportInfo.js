class ImportInfo {
  static moduleNameToVariableName(moduleName) {
    return moduleName.replace(/[@\-\/:]/g, '_');
  }

  /** @type { Array<string> } */
  variableName = [];
  /** @type { Array<[string, string | undefined]> } */
  specifier = [];

  /**
   * @param { string } prefixVariableName
   * @param { string } moduleName - 模块名
   * @param { boolean } exportDefault - 是否导出了default
   */
  constructor({ prefixVariableName, moduleName, exportDefault }) {
    this.prefixVariableName = prefixVariableName;
    this.moduleName = moduleName;
    this.exportDefault = exportDefault;
  }

  get formatVariableName() {
    return `${ this.prefixVariableName }${ ImportInfo.moduleNameToVariableName(this.moduleName) }`;
  }
}

module.exports = ImportInfo;