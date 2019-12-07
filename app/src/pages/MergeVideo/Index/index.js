/* 视频合并 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createSelector, createStructuredSelector } from 'reselect';
import { Link } from 'react-router-dom';
import { Button, message, Affix, Table, Popconfirm } from 'antd';
import classNames from 'classnames';
import $ from 'jquery';
import publicStyle from '../../../components/publicStyle/publicStyle.sass';
import { time } from '../../../utils';
import option, { type } from '../../../components/option/option';
import { mergeList } from '../reducer/reducer';
const fs = global.require('fs');
const path = global.require('path');
const child_process = global.require('child_process');

/* 子进程监听 */
function child_process_stdout(data) {
  console.log(data.toString());
}

function child_process_stderr(data) {
  console.log(data.toString());
}

function child_process_exit(code, data) {
  message.success('任务完成！');
}

function child_process_error(err) {
  message.error('发生错误，任务中断！');
}

/* 初始化数据 */
const state = createStructuredSelector({
  mergeList: createSelector( // 当前公演录播列表
    ($$state) => $$state.has('mergeVideo') ? $$state.get('mergeVideo') : null,
    ($$data) => $$data !== null ? $$data.get('mergeList').toJS() : []
  )
});

/* actions */
const actions = (dispatch) => ({
  action: bindActionCreators({
    mergeList
  }, dispatch)
});

@connect(state, actions)
class Index extends Component {
  static propTypes = {
    mergeList: PropTypes.array,
    action: PropTypes.objectOf(PropTypes.func)
  };

  // 表格配置
  columus() {
    const len = this.props.mergeList.length - 1;

    return [
      {
        title: '视频文件路径',
        dataIndex: 'path',
        key: 'path',
        width: '60%'
      },
      {
        title: '操作',
        key: 'handle',
        width: '40%',
        render: (value, item, index) => {
          return [
            <Popconfirm key="delete" title="确认要删除吗？" onConfirm={ this.handleDeleteClick.bind(this, index) }>
              <Button className={ publicStyle.mr10 } type="danger" size="small">删除</Button>
            </Popconfirm>,
            index === 0 ? null : (
              <Button key="upIndex"
                className={ publicStyle.mr10 }
                size="small" icon="arrow-up"
                onClick={ this.handleUpIndexClick.bind(this, index) }
              />
            ),
            index === len ? null : (
              <Button key="downIndex"
                size="small"
                icon="arrow-down"
                onClick={ this.handleDownIndexClick.bind(this, index) }
              />
            )
          ];
        }
      }
    ];
  }

  // 选择视频
  handleFileChange(event) {
    const x = [];

    for (const item of event.target.files) {
      x.push({
        id: Math.random(),
        path: item.path,
        name: item.name
      });
    }
    this.props.action.mergeList({
      mergeList: this.props.mergeList.concat(x)
    });
  }

  // 点击选择视频
  handleChooseClick(id, event) {
    $(`#${ id }`).click();
  }

  // 清空列表
  handleClearClick(event) {
    this.props.action.mergeList({
      mergeList: []
    });
    message.info('已清空列表！');
  }

  // 删除一个视频
  handleDeleteClick(index, event) {
    this.props.mergeList.splice(index, 1);
    this.props.action.mergeList({
      mergeList: this.props.mergeList
    });
  }

  // 合并
  handleMergeVideosClick(event) {
    if (this.props.mergeList.length > 0) {
      const fi = path.parse(this.props.mergeList[0].path);
      let title = '【视频合并】';
      let text = '';

      for (const item of this.props.mergeList) {
        title += item.name.match(/.{1,3}/g)[0] + '_';
        const p = type === 'Darwin' ? item.path : item.path.replace(/\\/g, '\\');

        text += `file '${ p }' \n`;
      }
      title += time('YYMMDDhhmmss') + fi.ext;
      text = '# ' + title + '\n' + text;

      // 写文件
      const textTitle = title + '.txt';
      const tp = option.output + '/' + textTitle;
      const textPath = type === 'Darwin' ? tp : tp.replace(/\//g, '\\');

      fs.writeFile(textPath, text, {
        encoding: 'utf8',
        flag: 'w'
      }, (err) => {
        if (err) return message.error('合并失败！');
        // 命令
        const child = child_process.spawn(option.ffmpeg, [
          '-f',
          'concat',
          '-safe',
          '0',
          '-i',
          textPath,
          '-c',
          'copy',
          option.output + '/' + title
        ]);

        child.stdout.on('data', child_process_stdout);
        child.stderr.on('data', child_process_stderr);
        child.on('close', child_process_exit);
        child.on('error', child_process_error);
      });
    } else {
      message.warn('没有视频！');
    }
  }

  // 视频上移
  handleUpIndexClick(index, event) {
    const middle = this.props.mergeList[index - 1];

    this.props.mergeList[index - 1] = this.props.mergeList[index];
    this.props.mergeList[index] = middle;
    this.props.action.mergeList({
      mergeList: this.props.mergeList
    });
  }

  // 视频下移
  handleDownIndexClick(index, event) {
    const middle = this.props.mergeList[index + 1];

    this.props.mergeList[index + 1] = this.props.mergeList[index];
    this.props.mergeList[index] = middle;
    this.props.action.mergeList({
      mergeList: this.props.mergeList
    });
  }

  render() {
    const { mergeList } = this.props;

    return [
      /* 功能区 */
      <Affix key="affix" className={ publicStyle.affix }>
        <div className={ classNames(publicStyle.toolsBox, 'clearfix') }>
          <div className={ publicStyle.fl }>
            <Button className={ publicStyle.mr10 }
              type="primary"
              icon="youtube"
              onClick={ this.handleChooseClick.bind(this, 'choose-video') }
            >
              选择视频
            </Button>
            <input id="choose-video"
              type="file"
              style={{ display: 'none' }}
              multiple={ true }
              onChange={ this.handleFileChange.bind(this) }
            />
            <Button icon="fork" onClick={ this.handleMergeVideosClick.bind(this) }>合并视频</Button>
          </div>
          <div className={ publicStyle.fr }>
            <Popconfirm title="确认要清空列表？" onConfirm={ this.handleClearClick.bind(this) }>
              <Button icon="frown">清空列表</Button>
            </Popconfirm>
            <Link className={ publicStyle.ml10 } to="/">
              <Button type="danger" icon="poweroff">返回</Button>
            </Link>
          </div>
        </div>
      </Affix>,
      /* 显示列表 */
      <div key="tableBox" className={ publicStyle.tableBox }>
        <Table bordered={ true }
          size="small"
          columns={ this.columus() }
          rowKey={ (item) => item.id }
          dataSource={ mergeList }
          pagination={{
            pageSize: mergeList.length
          }}
        />
      </div>
    ];
  }
}

export default Index;