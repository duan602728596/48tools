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
import { mergeList } from '../store/reducer';
const fs: Object = global.require('fs');
const path: Object = global.require('path');
const child_process: Object = global.require('child_process');

/* 子进程监听 */
function child_process_stdout(data: any): void {
  console.log(data.toString());
}

function child_process_stderr(data: any): void {
  console.log(data.toString());
}

function child_process_exit(code: any, data: any): void {
  message.success('任务完成！');
}

function child_process_error(err: any): void {
  message.error('发生错误，任务中断！');
}

/* 初始化数据 */
const state: Function = createStructuredSelector({
  mergeList: createSelector( // 当前公演录播列表
    ($$state: Immutable.Map): ?Immutable.Map => $$state.has('mergeVideo') ? $$state.get('mergeVideo') : null,
    ($$data: ?Immutable.Map): Array => $$data !== null ? $$data.get('mergeList').toJS() : []
  )
});

/* dispatch */
const dispatch: Function = (dispatch: Function): Object => ({
  action: bindActionCreators({
    mergeList
  }, dispatch)
});

@connect(state, dispatch)
class Index extends Component {
  static propTypes: Object = {
    mergeList: PropTypes.array,
    action: PropTypes.objectOf(PropTypes.func)
  };

  // 表格配置
  columus(): Array {
    const len: number = this.props.mergeList.length - 1;

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
        render: (value: any, item: Object, index: number): React.ChildrenArray<React.Element> => {
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
  handleFileChange(event: Event): void {
    const x: Object[] = [];

    for (const item: Object of event.target.files) {
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
  handleChooseClick(id: string, event: Event): void {
    $(`#${ id }`).click();
  }
  // 清空列表
  handleClearClick(event: Event): void {
    this.props.action.mergeList({
      mergeList: []
    });
    message.info('已清空列表！');
  }
  // 删除一个视频
  handleDeleteClick(index: number, event: Event): void {
    this.props.mergeList.splice(index, 1);
    this.props.action.mergeList({
      mergeList: this.props.mergeList
    });
  }
  // 合并
  handleMergeVideosClick(event: Event): void {
    if (this.props.mergeList.length > 0) {
      const fi: Object = path.parse(this.props.mergeList[0].path);
      let title: string = '【视频合并】';
      let text: string = '';

      for (const item: Object of this.props.mergeList) {
        title += item.name.match(/.{1,3}/g)[0] + '_';
        const p: string = type === 'Darwin' ? item.path : item.path.replace(/\\/g, '\\');

        text += `file '${ p }' \n`;
      }
      title += time('YYMMDDhhmmss') + fi.ext;
      text = '# ' + title + '\n' + text;
      // 写文件
      const textTitle: string = title + '.txt';
      const tp: string = option.output + '/' + textTitle;
      const textPath: string = type === 'Darwin' ? tp : tp.replace(/\//g, '\\');

      fs.writeFile(textPath, text, {
        encoding: 'utf8',
        flag: 'w'
      }, (err: Error): void => {
        if (err) return message.error('合并失败！');
        // 命令
        const child: Object = child_process.spawn(option.ffmpeg, [
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
  handleUpIndexClick(index: number, event: Event): void {
    const middle: Object = this.props.mergeList[index - 1];

    this.props.mergeList[index - 1] = this.props.mergeList[index];
    this.props.mergeList[index] = middle;
    this.props.action.mergeList({
      mergeList: this.props.mergeList
    });
  }
  // 视频下移
  handleDownIndexClick(index: number, event: Event): void {
    const middle: Object = this.props.mergeList[index + 1];

    this.props.mergeList[index + 1] = this.props.mergeList[index];
    this.props.mergeList[index] = middle;
    this.props.action.mergeList({
      mergeList: this.props.mergeList
    });
  }
  render(): React.ChildrenArray<React.Element> {
    const { mergeList }: { mergeList: [] } = this.props;

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
          rowKey={ (item: Object): number => item.id }
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