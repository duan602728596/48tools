/* 生成xlsx */
import React, { Component } from 'react';
import { message } from 'antd';
import { paiHang } from './search';
import { time } from '../../../function';
import option from '../../publicMethod/option';
import { juju, daka } from "./computingWds";
const fs = node_require('fs');
const process = node_require('process');
const xlsx = node_require('node-xlsx');

// 格式化
function format(list0: Array, list1: Array): Array{
  const res: Array[] = [];  // 返回的数据
  const l1: Object = {};    // 用于记录微打赏时间
  let all: number = 0;      // 统计总金额

  // 先存储打卡时间
  list1.map((item: Object, index: number): void=>{
    l1[item.id] = item.day;
  });

  // 根据打卡排行榜格式化数据
  list0.map((item: Object, index: number): void=>{
    all += item.money;
    res.push([
      index + 1,                        // 序号
      item.nickname,                    // 昵称
      String(item.money.toFixed(2)),    // 打卡金额
      l1[item.id]                       // 打卡时间
    ]);
  });
  return res;
}

// 查询排行
function paihangbang(item: Object): Promise{
  return Promise.all([
    paiHang(item.wdsid, 1),
    paiHang(item.wdsid, 2)
  ]).then((result: Array): { name: string, data: Array }=>{
    const l0: Object = JSON.parse(result[0]);
    const l1: Object = JSON.parse(result[1]);
    const jujuResult: Object = juju(l0.data.html);
    const l0h: Array = jujuResult.arr;
    const l1h: Array = daka(l1.data.html);
    const data: Array = (format(l0h, l1h));
    data.push([null], [`总金额（元）：${ String(jujuResult.allMount.toFixed(2)) }`]);
    data.unshift([item.wdstitle], [null], [
      '序号',
      'ID',
      '金额（元）',
      '时间（天）'
    ]);
    return {
      name: item.wdstitle,
      data
    };
  });
}

// 写入excel
function writeExcel(title: string, buffer: any): Promise{
  return new Promise((resolve: Function, reject: Function): void=>{
    fs.writeFile(`${ option.output }/【集资统计】${ title }_${ time('YY-MM-DD-hh-mm-ss') }.xlsx`, buffer, {
      'flag': 'w'
    }, (err)=>{
      if(err){
        reject();
      }else{
        resolve();
      }
    });
  });
}

async function generatingExcel(wdsList: { wdsid: string, wdstitle: string }[], pathname: string): void{
  try{
    const queue: Array = [];
    wdsList.map((item: Object, index: number)=>{
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
