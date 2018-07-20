const https = require('https');
const packageJson = require('../package.json');

/**
 * 对象转数组
 * @param { Object } obj: 对象
 */
function objectToArray(obj){
  const resultArr = [];
  for(const key in obj){
    resultArr.push({
      name: key,         // 包的名称
      version: obj[key]  // 包的当前版本号
    });
  }
  return resultArr;
}

/**
 * 查找包
 * @param { string } packageName: npm包名
 */
function requestPackageInformation(packageName){
  return new Promise((resolve, reject)=>{
    const req = https.request({
      hostname: 'registry.npmjs.org',
      path: `/${ packageName }`,
      port: null,
      method: 'GET',
      headers: {
        Accept: 'application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8, */*'
      }
    }, (res)=>{
      let data = null;
      res.setEncoding('utf8');
      res.on('data', (chunk)=>{
        if(data === null){
          data = chunk;
        }else{
          data += chunk;
        }
      });
      res.on('end', ()=>{
        resolve(JSON.parse(data));
      });
    });

    req.on('error', (err)=>{
      reject(err);
    });
    req.write('');
    req.end();
  }).catch((err)=>{
    console.error(err);
  });
}

/**
 * 判断依赖是否是最新的
 * @param { string } oldVersion: 旧版本
 * @param { string } newVersion: 新版本
 */
function isVersionEqual(oldVersion, newVersion){
  if(newVersion === null || newVersion === undefined){
    return false;
  }else if(/^(>=?|<=?|~|\^).*$/.test(oldVersion)){
    // 判断前面是否有特殊符号，比如>、>=、<、<=、~、^
    return oldVersion.replace(/(>=?|<=?|~|\^)/g, '') === newVersion;
  }else{
    return oldVersion === newVersion;
  }
}

/**
 * 格式化输出的版本号
 * @param { string } oldVersion: 旧版本
 * @param { string } newVersion: 新版本
 */
function formatVersion(oldVersion, newVersion){
  const iText = oldVersion.match(/^(>=?|<=?|~|\^)/);
  return ' '.repeat(iText ? iText[0].length : 0) + newVersion;
}

/**
 * 获取版本号
 * @param { Array } packageArray
 */
async function getVersionFromNpm(packageArray){
  try{
    const depQueue = [];
    for(let i = 0, j = packageArray.length; i < j; i++){
      depQueue.push(requestPackageInformation(packageArray[i].name));
    }
    const version = await Promise.all(depQueue);
    for(let i = 0, j = packageArray.length; i < j; i++){
      if('dist-tags' in version[i] && 'latest' in version[i]['dist-tags']){
        packageArray[i].latest = version[i]['dist-tags'].latest;
      }
      if('dist-tags' in version[i] && 'next' in version[i]['dist-tags']){
        packageArray[i].next = version[i]['dist-tags'].next;
      }
      if('dist-tags' in version[i] && 'rc' in version[i]['dist-tags']){
        packageArray[i].rc = version[i]['dist-tags'].rc;
      }
    }
  }catch(err){
    console.error(err);
  }
}

/**
 * 输出console.log文本
 * @param { Array } packageArray
 */
function consoleLogText(packageArray){
  let consoleText = '';
  for(let i = 0, j = packageArray.length; i < j; i++){
    const item = packageArray[i];
    const isLatestNew = isVersionEqual(item.version, item.latest);
    const isNextNew = isVersionEqual(item.version, item.next);
    const isRcNew = isVersionEqual(item.version, item.rc);
    consoleText += `${ isLatestNew || isNextNew || isRcNew ? '  ' : '* ' }${ item.name }:\n`;
    consoleText += `    version: ${ item.version }\n`;
    if(item.latest){
      consoleText += `    latest : ${ formatVersion(item.version, item.latest) }\n`;
    }
    if(item.next){
      consoleText += `    next   : ${ formatVersion(item.version, item.next) }\n`;
    }
    if(item.rc){
      consoleText += `    rc     : ${ formatVersion(item.version, item.rc) }\n`;
    }
  }
  return consoleText;
}

(async function start(){
  try{
    // 依赖
    const dependencies = 'dependencies' in packageJson ? objectToArray(packageJson.dependencies) : null;
    const devDependencies = 'devDependencies' in packageJson ? objectToArray(packageJson.devDependencies) : null;

    // 获取dep和dev的最新版本号
    if(dependencies){
      await getVersionFromNpm(dependencies);
    }

    if(devDependencies){
      await getVersionFromNpm(devDependencies);
    }

    // 输出
    let consoleText = '';

    if(dependencies){
      consoleText += 'dependencies:\n';
      consoleText += consoleLogText(dependencies);
    }

    if(devDependencies){
      consoleText += 'devDependencies:\n';
      consoleText += consoleLogText(devDependencies);
    }

    console.log(consoleText);
  }catch(err){
    console.error(err);
  }
})();