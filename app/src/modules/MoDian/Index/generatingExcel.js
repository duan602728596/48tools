/* 生成xlsx */
import React, { Component } from 'react';
import { message } from 'antd';
import { paiHang2 } from './search';
import { time } from '../../../utils';
import option from '../../../components/option/option';
const fs: Object = global.require('fs');
const xlsx: Object = global.require('node-xlsx');

// 格式化
function format(list0: Array, list1: Array): Array {
  const res: Array[] = []; // 返回的数据
  const l1: Map = new Map(); // 用于记录微打赏时间
  let all: number = 0; // 统计总金额

  // 先存储打卡时间
  list1.map((item: Object, index: number): void => {
    l1.set(item.nickname, item.support_days);
  });

  // 根据打卡排行榜格式化数据
  list0.map((item: Object, index: number): void => {
    all += Number(item.backer_money);
    res.push([
      index + 1, // 序号
      item.user_id, // user的id
      item.nickname, // 昵称
      item.backer_money, // 打卡金额
      l1.get(item.nickname) // 打卡时间
    ]);
  });

  return {
    all,
    data: res
  };
}

// 查询排行
function paihangbang(item: Object): Promise {
  return Promise.all([
    paiHang2(item.modianid, 1),
    paiHang2(item.modianid, 2)
  ]).then((result: Array): { name: string, data: Array } => {
    const { data, all }: {
      data: Array,
      all: number
    } = format(result[0], result[1]);

    data.push([null], [`总金额（元）：${ all.toFixed(2) }`], [`摩点ID：${ item.modianid }`]);
    data.unshift([item.modiantitle], [null], [
      '序号',
      '用户ID',
      '昵称',
      '金额（元）',
      '时间（天）'
    ]);

    return {
      name: item.modiantitle.replace(/[/\\*\[\]?"']/g, '.'),
      data
    };
  }).catch((err: any): void => {
    console.error(err);
  });
}

// 写入excel
function writeExcel(title: string, buffer: Buffer): Promise {
  const t: string = title.replace(/[/\\*\[\]?"']/g, '.');

  return new Promise((resolve: Function, reject: Function): void => {
    fs.writeFile(`${ option.output }/【集资统计】${ t }_${ time('YY-MM-DD-hh-mm-ss') }.xlsx`, buffer, {
      'flag': 'w'
    }, (err: Error): void => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  }).catch((err: any): void => {
    console.error(err);
  });
}

async function generatingExcel(modianList: { modianid: string, modiantitle: string }[], pathname: string): Promise<void> {
  try {
    const queue: Array = [];

    // 计算排行榜
    modianList.map((item: Object, index: number): void => {
      queue.push(paihangbang(item));
    });

    const result: Array = await Promise.all(queue);
    const buffer: any = xlsx.build(result);

    await writeExcel(pathname, buffer);

    message.success('生成Excel成功！');
  } catch (err) {
    console.error(err);
    message.error('生成Excel失败！');
  }
}

export default generatingExcel;