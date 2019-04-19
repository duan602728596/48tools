/* 根据excel计算总排行榜 */
import React, { Component, createRef } from 'react';
import { Link } from 'react-router-dom';
import { Button, message } from 'antd';
import style from './style.sass';
const path = global.require('path');
const fs = global.require('fs');
const xlsx = global.require('node-xlsx');

class TotalRanking extends Component {
  fileRef = createRef();

  //  读取文件
  readFile(filePath) {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, (err, chunk) => {
        if (err) {
          reject(err);
        } else {
          resolve(chunk);
        }
      });
    }).catch((err) => {
      console.error(err);
    });
  }

  // 写入excel
  writeExcel(filePath, buffer) {
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, buffer, {
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

  /* 快速排序 */
  quickSort(rawArray) {
    const len = rawArray.length;

    if (rawArray.length <= 1) {
      return rawArray;
    }
    const benchmark = rawArray[0];
    let left = [];
    let right = [];

    for (let i = 1; i < len; i++) {
      if (rawArray[i].backermoney > benchmark.backermoney) {
        left.push(rawArray[i]);
      } else {
        right.push(rawArray[i]);
      }
    }
    if (left.length > 1) {
      left = this.quickSort(left);
    }
    if (right.length > 1) {
      right = this.quickSort(right);
    }

    left.push(benchmark);

    return left.concat(right);
  }

  // 计算合并数据
  formatData(data) {
    const dataObj = {};

    data.forEach((value, index, array) => {
      if (value.userid in dataObj) {
        const item = dataObj[value.userid];

        if (item.nickname !== value.nickname) {
          if ('oldnickname' in item) {
            item.oldnickname.push(value.nickname);
          } else {
            item.oldnickname = [value.nickname];
          }
        }
        item.backermoney = item.backermoney + value.backermoney;
      } else {
        dataObj[value.userid] = value;
      }
    });

    return this.quickSort(Object.values(dataObj));
  }

  // 格式化数据
  formatArrayToObject(array) {
    const data = [];

    for (let i = 3, j = array.length; i < j; i++) {
      const item = array[i];

      if (item.length > 0) {
        data.push({
          userid: item[1],
          nickname: item[2],
          backermoney: Number(item[3])
        });
      } else {
        break;
      }
    }

    return data;
  }

  // 格式化数据
  formatObjectToArray(data) {
    const newData = [];
    let all = 0;

    data.forEach((value, index, array) => {
      const d = [
        index + 1,
        value.userid,
        value.nickname,
        value.backermoney
      ];

      if ('oldnickname' in value) {
        d.push(...value.oldnickname);
      }
      newData.push(d);
      all += value.backermoney;
    });
    newData.push([null], [`总金额（元）：${ all.toFixed(2) }`]);
    newData.unshift([
      '序号',
      '用户ID',
      '昵称',
      '金额（元）',
      '曾用昵称'
    ]);

    return newData;
  }

  // 计算并重新写入文件
  async writeXlsx(filePath) {
    try {
      const buffer = await this.readFile(filePath);
      const data = xlsx.parse(buffer);
      const newData = [];

      data.forEach((value, index, array) => {
        if (!value.name.includes('#')) { // # 总排行榜（'#'为判断标记，请勿删除）
          newData.push(...this.formatArrayToObject(value.data));
        }
      });
      const excelData = this.formatObjectToArray(this.formatData(newData));

      data.push({
        name: '# 总排行榜（"#"为判断是否计算的标记，请勿删除）',
        data: excelData
      });
      const excelBuffer = xlsx.build(data);

      await this.writeExcel(filePath, excelBuffer);
      message.success('成功！');
    } catch (err) {
      console.error(err);
      message.error('失败！');
    }
  }
  // 文件的类型变化
  handleFileChange = (event) => {
    if (event.target.files.length > 0) {
      const filePath = event.target.files[0].path;
      const fileInfor = path.parse(filePath);

      if (fileInfor.ext === '.xlsx') {
        this.writeXlsx(filePath);
      } else {
        message.warn('必须上传xlsx格式的文件。');
      }
    }
  };

  // 点击上传
  handleFileClick = (event) => {
    this.fileRef.current.click();
  };

  render() {
    return (
      <div className={ style.main }>
        <p className={ style.text }>
          导入前面生成的Excel，计算总集资排行榜。Excel请不要做修改，避免发生计算错误。
          <Link className={ style.text } to="/MoDian">
            <Button type="danger" icon="poweroff">返回</Button>
          </Link>
        </p>
        <div>
          <Button type="primary" onClick={ this.handleFileClick }>上传你的Excel</Button>
          <input ref={ this.fileRef } className={ style.disNone } type="file" onChange={ this.handleFileChange } />
        </div>
      </div>

    );
  }
}

export default TotalRanking;