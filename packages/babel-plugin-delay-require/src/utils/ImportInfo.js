class ImportInfo {
  static moduleNameToVariableName(moduleName) {
    return moduleName.replace(/[@\-\/:]/g, '_');
  }

  /**
   * @param { string } prefixVariableName
   * @param { string } moduleName: 模块名
   * @param { string | undefined } variableName: 变量名
   * @param { boolean } exportDefault: 是否导出了default
   * @param { Array<[string, string | undefined]> } specifier
   */
  constructor({
    prefixVariableName,
    moduleName,
    variableName,
    exportDefault,
    specifier
  }) {
    this.prefixVariableName = prefixVariableName;
    this.moduleName = moduleName;
    this.variableName = variableName;
    this.exportDefault = exportDefault;
    this.specifier = specifier;
  }

  get formatVariableName() {
    return `${ this.prefixVariableName }${ this.variableName ?? ImportInfo.moduleNameToVariableName(this.moduleName) }`;
  }
}

module.exports = ImportInfo;