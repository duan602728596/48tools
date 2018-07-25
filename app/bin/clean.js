/* 删除文件的脚本 */
const fs = require('fs');
const path = require('path');

/* 删除文件 */
function unlink(filePath){
  return new Promise((resolve, reject)=>{
    fs.unlink(filePath, (err)=>{
      if(err){
        reject(err);
      }else{
        console.log(`DELETE: ${ filePath }`);
        resolve();
      }
    });
  }).catch((err)=>{
    console.error(err);
  });
}

/* 删除文件夹 */
function rmdir(filePath){
  return new Promise((resolve, reject)=>{
    fs.rmdir(filePath, (err)=>{
      if(err){
        reject(err);
      }else{
        console.log(`DELETE: ${ filePath }`);
        resolve();
      }
    });
  }).catch((err)=>{
    console.error(err);
  });
}

/* 列出目录下的所有文件 */
function readdir(filePath){
  return new Promise((resolve, reject)=>{
    fs.readdir(filePath, (err, files)=>{
      if(err){
        reject(err);
      }else{
        resolve(files);
      }
    });
  }).catch((err)=>{
    console.error(err);
  });
}

(async function(){
  try{
    // 删除dll文件
    const scriptsPath = path.resolve(__dirname, '../build/script');
    const scripts = await readdir(scriptsPath);
    for(let i = 0, j = scripts.length; i < j; i++){
      const item = scripts[i];
      if(/^dll\./.test(item)){
        await unlink(path.resolve(scriptsPath, item));
        break;
      }
    }
  }catch(err){
    console.error(err);
  }
})();