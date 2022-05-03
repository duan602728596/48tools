interface Obj {
  [key: string]: any;
}

/**
 * omit函数的实现
 * @param { Obj } obj: object
 * @param { string[] } delKeys: 从object中删除的keys
 */
export function omit<T = Obj>(obj: Obj, delKeys: string[]): T {
  return Object.entries(obj).reduce(function(result: T, [key, value]: [string, any]): T {
    if (!delKeys.includes(key)) {
      result[key] = value;
    }

    return result;
  }, {} as any);
}

/**
 * pick函数的实现
 * @param { Obj } obj: object
 * @param { string[] } useKeys: object保留的keys
 */
export function pick<T = Obj>(obj: Obj, useKeys: string[]): T {
  return Object.entries(obj).reduce(function(result: T, [key, value]: [string, any]): T {
    if (useKeys.includes(key)) {
      result[key] = value;
    }

    return result;
  }, {} as any);
}