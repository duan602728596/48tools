class ImportInfo {
  static moduleNameToVariableName(moduleName) {
    return moduleName.replace(/[@\-\/:]/g, '_');
  }

  /**
   * @param { string } moduleName: 模块名
   * @param { string | undefined } variableName: 变量名
   * @param { boolean } exportDefault: 是否导出了default
   * @param { Array<[string, string | undefined]> } specifier
   */
  constructor({
    moduleName,
    variableName,
    exportDefault,
    specifier
  }) {
    this.moduleName = moduleName;
    this.variableName = variableName;
    this.exportDefault = exportDefault;
    this.specifier = specifier;
  }

  get formatVariableName() {
    return `__ELECTRON__DELAY_REQUIRE__${ this.variableName ?? ImportInfo.moduleNameToVariableName(this.moduleName) }`;
  }
}

exports.ImportInfo = ImportInfo;