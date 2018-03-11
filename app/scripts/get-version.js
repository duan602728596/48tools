const fs = require('fs');
const https = require('https');
const path = require('path');

/**
 * 获取package.json文件
 * dependencies：包
 * devDependencies：开发环境包
 */
function getPackageJson(){
  return new Promise((resolve, reject)=>{
    fs.readFile(path.join(__dirname, '../package.json'), (err, data)=>{
      if(err){
        reject(err);
      }else{
        resolve(JSON.parse(data));
      }
    });
  }).catch((err)=>{
    console.log(err);
  });
}

/* get请求，获取包的最新版本号 */
function getVersion(packageName){
  return new Promise((resolve, reject)=>{
    const options = {
      hostname: 'www.npmjs.com',
      port: null,
      path: '/-/search?from=0&size=10&quality=1.95&popularity=3.3&maintenance=2.05&text=' + packageName
    };

    const req = https.request(options, (res)=>{
      let getData = '';
      res.setEncoding('utf8');
      res.on('data', function(chunk){
        getData += chunk;
      });
      res.on('end', function(){
        resolve(getData);
      });
    });

    req.on('error', function(err){
      console.log('错误：' + err.message);
    });

    req.end();
  }).then((result)=>{
    const data = JSON.parse(result);
    const pkg = data.objects.length > 0 ? data.objects[0].package : null;
    const version = (pkg && packageName === pkg.name) ? pkg.version : 'No Package';
    return {
      packageName,
      version
    };
  });
}

/* 获取多个包 */
function all(pack){
  const pro = [];

  for(const key in pack){
    pro.push(getVersion(key));
  }

  return Promise.all(pro).then((result)=>{
    return result;
  });
}

/* 输出 */
function printf(oldObj, newObj, title){
  let txt ='========== ' + title + ' ==========' + '\n';

  newObj.map(function(item, index){
    const [ov, nv, name] = [
      oldObj[item.packageName],
      item.version,
      item.packageName,
    ];

    txt += (ov.includes(nv) ? ' ' : '*') + ' ' +
           item.packageName + ':\n' +
           '    old: ' + oldObj[item.packageName] + '\n' +
           '    new: ' + item.version + '\n';
  });

  console.log(txt);
}

/* app */
async function app(){
  const packages = await getPackageJson();

  const dependencies = 'dependencies' in packages ? packages.dependencies : {};
  const devDependencies = 'devDependencies' in packages ? packages.devDependencies : {};

  const dep = await all(dependencies);
  const dev = await all(devDependencies);

  printf(dependencies, dep, 'dependencies');
  printf(devDependencies, dev, 'devDependencies');
}

app();