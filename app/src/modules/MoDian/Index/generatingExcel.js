/* 生成xlsx */
import React, { Component } from 'react';
import { message } from 'antd';
import { paiHang2 } from './search';
import { time } from '../../../function';
import option from '../../publicMethod/option';
const fs: Object = global.require('fs');
const process: Object = global.require('process');
const xlsx: Object = global.require('node-xlsx');

// 格式化
function format(list0: Array, list1: Array): Array{
  const res: Array[] = [];    // 返回的数据
  const l1: Map = new Map();  // 用于记录微打赏时间
  let all: number = 0;        // 统计总金额

  // 先存储打卡时间
  list1.map((item: Object, index: number): void=>{
    l1.set(item.nickname, item.support_days);
  });

  // 根据打卡排行榜格式化数据
  list0.map((item: Object, index: number): void=>{
    all += Number(item.backer_money);
    res.push([
      index + 1,                        // 序号
      item.nickname,                    // 昵称
      item.backer_money,                // 打卡金额
      l1.get(item.nickname)             // 打卡时间
    ]);
  });
  return {
    all,
    data: res
  };
}

// 查询排行
function paihangbang(item: Object): Promise{
  let l0: ?Array = null;
  let l1: ?Array = null;
  return paiHang2(item.modianid, 1)  // 此处不使用Promise.all是为了避免缓存
    .then((result: Array): Promise=>{
      l0 = result;
      return new Promise((resolve: Function, reject: Function): void=>{
        setTimeout((): void=>{
          resolve();
        }, 12000);
      }); // 避免缓存，所以延迟获取数据
    })
    .then((): Promise => paiHang2(item.modianid, 2))
    .then((result: Array): void=>{
      l1 = result;
    })
    .then((): { name: string, data: Array }=>{
      const { data, all }: {
        data: Array,
        all: number
      } = format(l0, l1);
      data.push([null], [`总金额（元）：${ all.toFixed(2) }`]);
      data.unshift([item.modiantitle], [null], [
        '序号',
        '昵称',
        '金额（元）',
        '时间（天）'
      ]);
      return {
        name: item.modiantitle,
        data
      };
    });
}

// 写入excel
function writeExcel(title: string, buffer: any): Promise{
  return new Promise((resolve: Function, reject: Function): void=>{
    fs.writeFile(`${ option.output }/【集资统计】${ title }_${ time('YY-MM-DD-hh-mm-ss') }.xlsx`, buffer, {
      'flag': 'w'
    }, (err: any): void=>{
      if(err){
        reject();
      }else{
        resolve();
      }
    });
  });
}

async function generatingExcel(modianList: { modianid: string, modiantitle: string }[], pathname: string): Promise<void>{
  try{
    const queue: Array = [];
    // 计算排行榜
    modianList.map((item: Object, index: number): void=>{
      queue.push(paihangbang(item));
    });

    const result: Array = await Promise.all(queue);

    const buffer: any = xlsx.build(result);
    await writeExcel(pathname, buffer);

    message.success('生成Excel成功！');
  }catch(err){
    console.error(err);
    message.error('生成Excel失败！');
  }
}

export default generatingExcel;
