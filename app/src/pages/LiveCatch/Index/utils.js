/**
 * 每当获取新列表时，判断旧列表内是否有过期的数据，且数据在直播
 * @param { Array } oldRawArray: 旧数据
 * @param { Array } newRawArray: 新数据
 * @param { ?Map } catchMap    : 正在录制
 * @return { Array }           : 返回正在录制的旧数据
 */
export function oldArray(oldRawArray, newRawArray, catchMap) {
  // 将新数据内的liveId提取成数组
  const newIdList = [];

  for (let i = 0, j = newRawArray.length; i < j; i++) {
    newIdList.push(newRawArray[i].liveId);
  }
  // 循环旧数组
  const oldList = [];

  if (oldRawArray) {
    for (let i = 0, j = oldRawArray.length; i < j; i++) {
      const item = oldRawArray[i];

      if (!newIdList.includes(item.liveId) && catchMap && catchMap.has(item.liveId)) {
        item._end = true;
        oldList.push(item);
      }
    }
  }

  return oldList;
}