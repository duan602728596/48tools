/* 生成xlsx */
import React, { Component } from 'react';
import { message } from 'antd';
import { paiHang2 } from './search';
import { time } from '../../../utils';
import option from '../../../components/option/option';
const fs = global.require('fs');
const xlsx = global.require('node-xlsx');

// 格式化
function format(list0, list1) {
  const res = []; // 返回的数据
  const l1 = new Map(); // 用于记录微打赏时间
  let all = 0; // 统计总金额

  // 先存储打卡时间
  list1.map((item, index) => {
    l1.set(item.nickname, item.support_days);
  });

  // 根据打卡排行榜格式化数据
  list0.map((item, index) => {
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
async function paihangbang(item) {
  const result = await Promise.all([
    paiHang2(item.modianid, 1),
    paiHang2(item.modianid, 2)
  ]);

  const { data, all } = format(result[0], result[1]);

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
}

// 写入excel
function writeExcel(title, buffer) {
  const t = title.replace(/[/\\*\[\]?"']/g, '.');

  return new Promise((resolve, reject) => {
    fs.writeFile(`${ option.output }/【集资统计】${ t }_${ time('YY-MM-DD-hh-mm-ss') }.xlsx`, buffer, {
      'flag': 'w'
    }, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  }).catch((err) => {
    console.error(err);
  });
}

async function generatingExcel(modianList, pathname) {
  try {
    const queue = [];

    // 计算排行榜
    modianList.map((item, index) => {
      queue.push(paihangbang(item));
    });

    const result = await Promise.all(queue);
    const buffer = xlsx.build(result);

    await writeExcel(pathname, buffer);

    message.success('生成Excel成功！');
  } catch (err) {
    console.error(err);
    message.error('生成Excel失败！');
  }
}

export default generatingExcel;