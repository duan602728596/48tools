export function checkEmptyString(str: string | undefined | null): string | undefined {
  if ((typeof str === 'string' && str === '') || (str === undefined || str === null)) {
    return undefined;
  }

  return str;
}