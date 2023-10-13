import * as process from 'process';
// @ts-ignore
import commandLineArgs from 'command-line-args';
import type { OptionDefinition, CommandLineOptions as _CommandLineOptions } from 'command-line-args';
import { isDevelopment, isTest } from './utils.mjs';

/* 解析命令行 */
const optionDefinitions: Array<OptionDefinition> = [
  { name: 'enable-48-room-message-local-message', type: Boolean, defaultValue: isDevelopment },
  { name: 'enable-48-qingchunshike', type: Boolean, defaultValue: isDevelopment }
];

export interface CommandLineOptions extends _CommandLineOptions {
  'enable-48-room-message-local-message'?: boolean;
  'enable-48-qingchunshike'?: boolean;
}

export const commandLineOptions: CommandLineOptions = isTest ? {} : commandLineArgs(optionDefinitions, {
  argv: isDevelopment ? undefined : process.argv.slice(1)
});