const fs = require('fs');
const path = require('path');

/* 格式化的文件夹目录 */
const root = path.resolve(__dirname, '../');       // 根目录
const folder = ['bin', 'config', 'server', 'src']; // 需要读取的子目录
const ext = ['.js', '.sass', '.pug'];              // 需要格式化的文件
const emptyLineAtTheEndOfTheLine = [];             // 行尾有空行

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

/* 判断是文件还是文件夹 */
function stat(filePath){
  return new Promise((resolve, reject)=>{
    fs.stat(filePath, (err, stats)=>{
      if(err){
        reject(err);
      }else{
        resolve(stats);
      }
    });
  }).catch((err)=>{
    console.error(err);
  });
}

/* 迭代 */
async function foldersMap(filePath){
  try{
    const fStat = await stat(filePath);
    if(fStat.isFile()){
      await formatFile(filePath);
    }else if(fStat.isDirectory()){
      // 获取目录
      const files = await readdir(filePath);
      for(let i = 0, j = files.length; i < j; i++){
        const item = files[i];
        const itemFilePath = path.join(filePath, item);
        await foldersMap(itemFilePath);
      }
    }
  }catch(err){
    console.error(err);
  }
}

/* 读取文件 */
function readFile(filePath){
  return new Promise((resolve, reject)=>{
    fs.readFile(filePath, (err, chunk)=>{
      if(err){
        reject(err);
      }else{
        resolve(chunk);
      }
    });
  }).catch((err)=>{
    console.error(err);
  });
}

/* 格式化文件 */
async function formatFile(filePath){
  try{
    const infor = path.parse(filePath);
    if(ext.includes(infor.ext)){
      const chunk = await readFile(filePath);
      const str = chunk.toString();
      // 判断是否有尾行
      const strArr = str.split(/\n/);
      if(strArr[strArr.length - 1] === ''){
        emptyLineAtTheEndOfTheLine.push(filePath);
      }
    }
  }catch(err){
    console.error(err);
  }
}

(async function (){
  try{
    // 获取目录
    const files = await readdir(root);

    for(let i = 0, j = files.length; i < j; i++){
      const item = files[i];
      if(folder.includes(item)){
        const itemFilePath = path.join(root, item);
        await foldersMap(itemFilePath);
      }
    }
    
    // 输出结果
    let consoleText = '行尾有空格：';
    if(emptyLineAtTheEndOfTheLine.length === 0){
      consoleText += '无文件';
    }else{
      for(let i = 0, j = emptyLineAtTheEndOfTheLine.length; i < j; i++){
        consoleText += `\n* ${ emptyLineAtTheEndOfTheLine[i] }`;
      }
    }
    console.log(consoleText);
  }catch(err){
    console.error(err);
  }
})();