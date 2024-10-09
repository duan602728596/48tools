import process from 'node:process';
import semver from 'semver';

/* 根据不同的nodejs版本加载不同的文件 */
let jsonImport;

if (semver.gte(process.version, '22.0.0')) {
  jsonImport = await import('./importAttributes.mjs');
} else {
  jsonImport = await import('./importAssertions.mjs');
}

export const packageJson = jsonImport.packageJson;
export const lernaJson = jsonImport.lernaJson;
export const appPackageJson = jsonImport.appPackageJson;