/* 视频剪切 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createSelector, createStructuredSelector } from 'reselect';
import { Link } from 'react-router-dom';
import { Button, Table, Affix, message, Input, Popconfirm, Form } from 'antd';
import classNames from 'classnames';
import $ from 'jquery';
import { time, patchZero } from '../../../utils';
import { cutList, taskChange } from '../store/reducer';
import computingTime from './computingTime';
import option from '../../../components/option/option';
import style from './style.sass';
import publicStyle from '../../../components/publicStyle/publicStyle.sass';
const child_process = global.require('child_process');
const path = global.require('path');

/* 子进程监听 */
function child_process_stdout(data) {
  // console.log(data.toString());
}

function child_process_stderr(data) {
  // console.log(data.toString());
}

/* 初始化数据 */
const getState = ($$state) => $$state.has('cut') ? $$state.get('cut') : null;

const state = createStructuredSelector({
  cutList: createSelector( // 剪切队列
    getState,
    ($$data) => $$data !== null ? $$data.get('cutList').toJS() : []
  ),
  cutMap: createSelector( // 正在剪切
    getState,
    ($$data) => $$data !== null ? $$data.get('cutMap') : new Map()
  )
});

/* dispatch */
const dispatch = (dispatch) => ({
  action: bindActionCreators({
    cutList,
    taskChange
  }, dispatch)
});

@Form.create()
@connect(state, dispatch)
class Index extends Component {
  static propTypes = {
    cutList: PropTypes.array,
    cutMap: PropTypes.object,
    action: PropTypes.objectOf(PropTypes.func),
    form: PropTypes.object
  };

  constructor() {
    super(...arguments);

    this.dir = option.output.replace(/\//g, '\\');
    this.state = {
      file: null, // 选择文件
      saveFile: null // 保存文件
    };
  }

  // 表格配置
  columus() {
    const columus = [
      {
        title: '视频文件地址',
        dataIndex: 'file',
        key: 'file',
        width: '30%',
        render: (value, item) => item.file.path
      },
      {
        title: '开始时间',
        key: 'startTime',
        width: '10%',
        render: (value, item, index) => {
          const { starthh, startmm, startss } = item;

          return `${ patchZero(Number(starthh)) } : ${ patchZero(Number(startmm)) } : ${ patchZero(Number(startss)) }`;
        }
      },
      {
        title: '结束时间',
        key: 'endTime',
        width: '10%',
        render: (value, item, index) => {
          const { endhh, endmm, endss } = item;

          return `${ patchZero(Number(endhh)) } : ${ patchZero(Number(endmm)) } : ${ patchZero(Number(endss)) }`;
        }
      },
      {
        title: '文件保存位置',
        dataIndex: 'saveFile',
        key: 'saveFile',
        width: '30%',
        render: (value, item, index) => item.saveFile.path
      },
      {
        title: '操作',
        key: 'handle',
        width: '20%',
        render: (value, item, index) => {
          if (this.props.cutMap.has(item.id)) {
            const m = this.props.cutMap.get(item.id);

            if (m.child.exitCode !== null) {
              return [
                <b key="stop" className={ publicStyle.mr10 }>任务结束</b>,
                <Popconfirm key="delete" title="确认删除任务吗？" onConfirm={ this.handleDeleteTaskClick.bind(this, item) }>
                  <Button type="danger" icon="delete">删除任务</Button>
                </Popconfirm>
              ];
            } else {
              return (
                <Popconfirm title="确认停止任务吗？" onConfirm={ this.handleStopTaskClick.bind(this, item) }>
                  <Button type="danger" icon="close-circle">停止任务</Button>
                </Popconfirm>
              );
            }
          } else {
            return [
              <Button key="start" className={ publicStyle.mr10 }
                type="primary"
                icon="rocket"
                onClick={ this.handleStartTaskClick.bind(this, item) }
              >
                开始任务
              </Button>,
              <Popconfirm key="delete" title="确认删除任务吗？" onConfirm={ this.handleDeleteTaskClick.bind(this, item) }>
                <Button type="danger" icon="delete">删除任务</Button>
              </Popconfirm>
            ];
          }
        }
      }
    ];

    return columus;
  }

  // 选择文件的change事件
  handleFileChange(event) {
    const save = document.getElementById('cut-save');
    const file = event.target.files[0] || null;
    let title = '';

    if (file) {
      const { name, ext } = path.parse(file.path);

      title = '【视频剪切】' + name + '_' + time('YY-MM-DD-hh-mm-ss') + ext;
    }
    this.setState({
      file
    });
    save.nwsaveas = title;
  }

  // 储存文件的change事件
  handleSaveChange(event) {
    const file = event.target.files[0] || null;

    this.setState({
      saveFile: file
    });
  }

  // 点击input
  handleClickInputClick(id, event) {
    $(`#${ id }`).click();
  }

  // 添加到队列
  handleAddQueueClick(event) {
    event.preventDefault();
    this.props.form.validateFields((err, value) => {
      if (!err) {
        const cutList = this.props.cutList.slice();
        const { file, saveFile } = this.state;
        const { starthh, startmm, startss, endhh, endmm, endss } = value;

        cutList.push({
          id: new Date().getTime(),
          file,
          saveFile,
          starthh: (starthh === undefined || /^\s*$/i.test(starthh)) ? '0' : starthh,
          startmm: (startmm === undefined || /^\s*$/i.test(startmm)) ? '0' : startmm,
          startss: (startss === undefined || /^\s*$/i.test(startss)) ? '0' : startss,
          endhh: (endhh === undefined || /^\s*$/i.test(endhh)) ? '0' : endhh,
          endmm: (endmm === undefined || /^\s*$/i.test(endmm)) ? '0' : endmm,
          endss: (endss === undefined || /^\s*$/i.test(endss)) ? '0' : endss
        });

        this.props.action.cutList({
          cutList
        });
        this.props.form.resetFields(); // 重置表单
        this.setState({
          file: null, // 选择文件
          saveFile: null // 保存文件
        });
        {
          const $file = $('#cut-file');
          const $save = $('#cut-save');

          $file.val('');
          $save.val('');
          $save.prop('nwsaveas', '');
        }
      }
    });
  }

  // 删除任务
  handleDeleteTaskClick(item, event) {
    const index = this.props.cutList.indexOf(item);

    this.props.cutList.splice(index, 1);
    this.props.action.cutList({
      cutList: this.props.cutList.slice()
    });
  }

  /**
   * 子进程监听
   * 子进程关闭时自动删除itemId对应的Map
   */
  child_process_exit(item, code, data) {
    console.log('exit: ' + code + ' ' + data);
    this.child_process_cb(item);
  }

  child_process_error(item, err) {
    console.error('error: \n' + err);
    this.child_process_cb(item);
  }

  // 子进程关闭
  child_process_cb(item) {
    this.props.action.cutList({
      cutList: this.props.cutList
    });
    message.success(`剪切成功【${ item.file.path } => ${ item.saveFile.path }】`);
  }

  // 开始任务
  handleStartTaskClick(item, event) {
    const { starthh, startmm, startss, endhh, endmm, endss } = item;
    const [h, m, s] = computingTime(
      [Number(starthh), Number(startmm), Number(startss)],
      [Number(endhh), Number(endmm), Number(endss)]
    );
    // 根据文件扩展名判断是保存成gif还是视频
    const { ext } = path.parse(item.saveFile.path);
    const arg = ext === '.gif' ? [
      '-ss',
      `${ patchZero(Number(starthh)) }:${ patchZero(Number(startmm)) }:${ patchZero(Number(startss)) }`,
      '-t',
      `${ patchZero(h) }:${ patchZero(m) }:${ patchZero(s) }`,
      '-i',
      item.file.path,
      item.saveFile.path
    ] : [
      '-ss',
      `${ patchZero(Number(starthh)) }:${ patchZero(Number(startmm)) }:${ patchZero(Number(startss)) }`,
      '-t',
      `${ patchZero(h) }:${ patchZero(m) }:${ patchZero(s) }`,
      '-accurate_seek',
      '-i',
      item.file.path,
      '-acodec',
      'copy',
      '-vcodec',
      'copy',
      item.saveFile.path
    ];

    const child = child_process.spawn(option.ffmpeg, arg);

    child.stdout.on('data', child_process_stdout);
    child.stderr.on('data', child_process_stderr);
    child.on('exit', this.child_process_exit.bind(this, item));
    child.on('error', this.child_process_error.bind(this, item));

    this.props.cutMap.set(item.id, {
      item,
      child
    });

    this.props.action.taskChange({
      cutMap: this.props.cutMap,
      cutList: this.props.cutList
    });

    message.info(`开始剪切【${ item.file.path } => ${ item.saveFile.path }】`);
  }

  // 停止任务
  handleStopTaskClick(item, event) {
    const m = this.props.cutMap.get(item.id);

    m.child.kill();
  }

  render() {
    const { getFieldDecorator } = this.props.form; // 包装表单控件

    return [
      /* 功能区 */
      <Affix key="affix" className={ publicStyle.affix }>
        <div className={ classNames(publicStyle.toolsBox, style.toolsBox, 'clearfix') }>
          <div className={ publicStyle.fl }>
            <p className={ style.tishi }>提示：文件保存成“gif”格式可导出动图。</p>
            <Form layout="inline" onSubmit={ this.handleAddQueueClick.bind(this) }>
              <div className={ style.fileGroup }>
                <Form.Item label="文件地址">
                  {
                    getFieldDecorator('file', {
                      rules: [
                        {
                          message: '选择视频文件',
                          required: true
                        }
                      ]
                    })(
                      <div>
                        <Button size="default" onClick={ this.handleClickInputClick.bind(this, 'cut-file') }>选择视频文件</Button>
                        <span className={ style.path }>{ this.state.file ? this.state.file.path : '' }</span>
                        <input className={ style.disNone } id="cut-file" type="file" onChange={ this.handleFileChange.bind(this) } />
                      </div>
                    )
                  }
                </Form.Item>
              </div>
              <div className={ style.fileGroup }>
                <Form.Item label="保存地址">
                  {
                    getFieldDecorator('saveFile', {
                      rules: [
                        {
                          message: '选择保存位置',
                          required: true
                        }
                      ]
                    })(
                      <div>
                        <Button size="default" onClick={ this.handleClickInputClick.bind(this, 'cut-save') }>选择保存位置</Button>
                        <span className={ style.path }>{ this.state.saveFile ? this.state.saveFile.path : '' }</span>
                        <input className={ style.disNone }
                          id="cut-save"
                          type="file"
                          nwsaveas=""
                          nwworkingdir={ this.dir }
                          onChange={ this.handleSaveChange.bind(this) }
                        />
                      </div>
                    )
                  }
                </Form.Item>
              </div>
              <div className={ style.optGroup }>
                <Form.Item className={ classNames(style.formItem, style.timeGroup) } label="开始时间">
                  {
                    getFieldDecorator('starthh', {
                      rules: [
                        {
                          message: '时间格式错误',
                          type: 'number',
                          min: 0,
                          transform: (value = '') => Number(value)
                        }
                      ]
                    })(
                      <Input className={ style.input } />
                    )
                  }
                </Form.Item>
                <span className={ style.maohao }>:</span>
                <Form.Item className={ style.formItem }>
                  {
                    getFieldDecorator('startmm', {
                      rules: [
                        {
                          message: '时间格式错误',
                          type: 'number',
                          min: 0,
                          max: 59,
                          transform: (value = '') => Number(value)
                        }
                      ]
                    })(
                      <Input className={ style.input } />
                    )
                  }
                </Form.Item>
                <span className={ style.maohao }>:</span>
                <Form.Item className={ style.formItem }>
                  {
                    getFieldDecorator('startss', {
                      rules: [
                        {
                          message: '时间格式错误',
                          type: 'number',
                          min: 0,
                          max: 59,
                          transform: (value = '') => Number(value)
                        }
                      ]
                    })(
                      <Input className={ style.input } />
                    )
                  }
                </Form.Item>
                <Form.Item className={ classNames(style.formItem, style.end) } label="结束时间">
                  {
                    getFieldDecorator('endhh', {
                      rules: [
                        {
                          message: '时间格式错误',
                          type: 'number',
                          min: 0,
                          transform: (value = '') => Number(value)
                        }
                      ]
                    })(
                      <Input className={ style.input } />
                    )
                  }
                </Form.Item>
                <span className={ style.maohao }>:</span>
                <Form.Item className={ style.formItem }>
                  {
                    getFieldDecorator('endmm', {
                      rules: [
                        {
                          message: '时间格式错误',
                          type: 'number',
                          min: 0,
                          max: 59,
                          transform: (value = '') => Number(value)
                        }
                      ]
                    })(
                      <Input className={ style.input } />
                    )
                  }
                </Form.Item>
                <span className={ style.maohao }>:</span>
                <Form.Item className={ style.formItem }>
                  {
                    getFieldDecorator('endss', {
                      rules: [
                        {
                          message: '时间格式错误',
                          type: 'number',
                          min: 0,
                          max: 59,
                          transform: (value = '') => Number(value)
                        }
                      ]
                    })(
                      <Input className={ style.input } />
                    )
                  }
                </Form.Item>
                <Button className={ style.addBtn } type="primary" htmlType="submit" size="default">添加到队列</Button>
              </div>
            </Form>
          </div>
          <div className={ publicStyle.fr }>
            <Link className={ publicStyle.ml10 } to="/">
              <Button type="danger" icon="poweroff">返回</Button>
            </Link>
          </div>
        </div>
      </Affix>,
      /* 显示列表 */
      <div key="tableBox" className={ classNames(publicStyle.tableBox, style.tableBox) }>
        <Table loading={ this.state.loading }
          bordered={ true }
          columns={ this.columus() }
          rowKey={ (item) => item.id }
          dataSource={ this.props.cutList }
          pagination={{
            pageSize: 20,
            showQuickJumper: true
          }}
        />
      </div>
    ];
  }
}

export default Index;