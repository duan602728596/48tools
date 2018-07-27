/* 文件处理 */
const fs = require('fs');
const path = require('path');

/* 删除文件 */
function unlink(filePath){
  return new Promise((resolve, reject)=>{
    fs.unlink(filePath, (err)=>{
      if(err){
        reject(err);
      }else{
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

/* 移动文件 */
function rename(oldFilePath, newFilePath){
  return new Promise((resolve, reject)=>{
    fs.rename(oldFilePath, newFilePath, (err)=>{
      if(err){
        reject(err);
      }else{
        resolve();
      }
    });
  }).catch((err)=>{
    console.error(err);
  });
}

/* 创建文件夹 */
function mkdir(filePath){
  return new Promise((resolve, reject)=>{
    fs.mkdir(filePath, (err)=>{
      if(err){
        reject(err);
      }else{
        resolve();
      }
    });
  }).catch((err)=>{
    console.error(err);
  });
}