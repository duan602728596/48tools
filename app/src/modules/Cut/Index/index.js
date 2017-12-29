/* 视频剪切 */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createSelector, createStructuredSelector } from 'reselect';
import { Link, withRouter } from 'react-router-dom';
import { Button, Table, Affix, message, Input, Popconfirm, Form } from 'antd';
import { time, patchZero } from '../../../function';
import { cutList, taskChange } from '../store/reducer';
import computingTime from './computingTime';
import option from '../../publicMethod/option';
import style from './style.sass';
import publicStyle from '../../publicMethod/public.sass';
const child_process = node_require('child_process');
const path = node_require('path');

/* 子进程监听 */
function child_process_stdout(data: any): void{
  // console.log(data.toString());
}

function child_process_stderr(data: any): void{
  // console.log(data.toString());
}

/* 初始化数据 */
const getState: Function = ($$state: Immutable.Map): ?Immutable.Map => $$state.has('cut') ? $$state.get('cut') : null;

const state: Function = createStructuredSelector({
  cutList: createSelector(         // 剪切队列
    getState,
    ($$data: ?Immutable.Map): Array=>{
      const cutList: Immutable.List | Array = $$data !== null ? $$data.get('cutList') : [];
      return cutList instanceof Array ? cutList : cutList.toJS()
    }
  ),
  cutMap: createSelector(          // 正在剪切
    getState,
    ($$data: ?Immutable.Map): Map => $$data !== null ? $$data.get('cutMap') : new Map()
  )
});

/* dispatch */
const dispatch: Function = (dispatch: Function): Object=>({
  action: bindActionCreators({
    cutList,
    taskChange
  }, dispatch)
});

@withRouter
@Form.create()
@connect(state, dispatch)
class Cut extends Component{
  dir: string;
  state: {
    file: ?Object,
    saveFile: ?Object
  };
  constructor(): void{
    super(...arguments);

    this.dir = option.output.replace(/\//g, '\\');
    this.state = {
      file: null,      // 选择文件
      saveFile: null   // 保存文件
    };
  }
  // 表格配置
  columus(): Array{
    const columus: Array = [
      {
        title: '视频文件地址',
        dataIndex: 'file',
        key: 'file',
        width: '30%',
        render: (text: any, item: Object): string=>item.file.path
      },
      {
        title: '开始时间',
        key: 'startTime',
        width: '10%',
        render: (text: any, item: Object): string=>{
          const { starthh, startmm, startss }: {
            starthh: number,
            startmm: number,
            startss: number
          } = item;
          return `${ patchZero(Number(starthh)) } : ${ patchZero(Number(startmm)) } : ${ patchZero(Number(startss)) }`;
        }
      },
      {
        title: '结束时间',
        key: 'endTime',
        width: '10%',
        render: (text: any, item: Object): string=>{
          const { endhh, endmm, endss }: {
            endhh: number,
            endmm: number,
            endss: number
          } = item;
          return `${ patchZero(Number(endhh)) } : ${ patchZero(Number(endmm)) } : ${ patchZero(Number(endss)) }`;
        }
      },
      {
        title: '文件保存位置',
        dataIndex: 'saveFile',
        key: 'saveFile',
        width: '30%',
        render: (text: any, item: Object): string=>item.saveFile.path
      },
      {
        title: '操作',
        key: 'handle',
        width: '20%',
        render: (text: any, item: Object): Object | Array=>{
          if(this.props.cutMap.has(item.id)){
            const m: Map = this.props.cutMap.get(item.id);
            if(m.child.exitCode !== null){
              return [
                <b key={ 0 } className={ publicStyle.mr10 }>任务结束</b>,
                <Popconfirm key={ 1 } title="确认删除任务吗？" onConfirm={ this.onDeleteTask.bind(this, item) }>
                  <Button type="danger" icon="delete">删除任务</Button>
                </Popconfirm>
              ];
            }else{
              return (
                <Popconfirm title="确认停止任务吗？" onConfirm={ this.onStopTask.bind(this, item) }>
                  <Button type="danger" icon="close-circle">停止任务</Button>
                </Popconfirm>
              );
            }
          }else{
            return [
              <Button key={ 0 } className={ publicStyle.mr10 } type="primary" icon="rocket" onClick={ this.onStartTask.bind(this, item) }>开始任务</Button>,
              <Popconfirm key={ 1 } title="确认删除任务吗？" onConfirm={ this.onDeleteTask.bind(this, item) }>
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
  onFileChange(event: Event): void{
    const save: any = document.getElementById('cut-save');
    const file: ?Object = event.target.files[0] || null;
    let title: string = '';
    if(file){
      const { name, ext }: {
        name: string,
        ext: string
      } = path.parse(file.path);
      title = '【视频剪切】' + name + '_' + time('YY-MM-DD-hh-mm-ss') + ext;
    }
    this.setState({
      file
    });
    save.nwsaveas = title;
  }
  // 储存文件的change事件
  onSaveChange(event: Event): void{
    const file: ?Object = event.target.files[0] || null;
    this.setState({
      saveFile: file
    });
  }
  // 点击input
  onClickInput(id: string, event: Event): void{
    $(`#${ id }`).click();
  }
  // 添加到队列
  onAddQueue(event: Event): void{
    event.preventDefault();
    this.props.form.validateFields(async (err: ?any, value: any): void=>{
      if(!err){
        const cutList: Array = this.props.cutList.slice();
        const { file, saveFile }: {
          file: Object,
          saveFile: Object,
        } = this.state;
        const { starthh, startmm, startss, endhh, endmm, endss }: {
          starthh: ?string,
          startmm: ?string,
          startss: ?string,
          endhh: ?string,
          endmm: ?string,
          endss: ?string
        } = value;
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
          file: null,      // 选择文件
          saveFile: null   // 保存文件
        });
        {
          const $file: any = $('#cut-file');
          const $save: any = $('#cut-save');
          $file.val('');
          $save.val('');
          $save.prop('nwsaveas', '');
        }
      }
    });
  }
  // 删除任务
  onDeleteTask(item: Object, event: Event): void{
    const index: number = this.props.cutList.indexOf(item);
    this.props.cutList.splice(index, 1);
    this.props.action.cutList({
      cutList: this.props.cutList.slice()
    });
  }
  /**
   * 子进程监听
   * 子进程关闭时自动删除itemId对应的Map
   */
  child_process_exit(item: Object, code: any, data: any): void{
    console.log('exit: ' + code + ' ' + data);
    this.child_process_cb(item);
  }
  child_process_error(item: Object, err: any): void{
    console.error('error: \n' + err);
    this.child_process_cb(item);
  }
  // 子进程关闭
  async child_process_cb(item: Object): void{
    this.props.action.cutList({
      cutList: this.props.cutList.slice()
    });
    message.success(`剪切成功【${ item.file.path } => ${ item.saveFile.path }】`);
  }
  // 开始任务
  onStartTask(item: Object, event: Event): void{
    const { starthh, startmm, startss, endhh, endmm, endss }: {
      starthh: number,
      startmm: number,
      startss: number,
      endhh: number,
      endmm: number,
      endss: number
    } = item;
    const [h, m, s]: number[] = computingTime(
      [Number(starthh), Number(startmm), Number(startss)],
      [Number(endhh), Number(endmm), Number(endss)]
    );
    // 根据文件扩展名判断是保存成gif还是视频
    const { ext }: { ext: string } = path.parse(item.saveFile.path);
    const arg: string[] = ext === '.gif' ? [
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

    const child: Object = child_process.spawn(option.ffmpeg, arg);
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
      cutList: this.props.cutList.slice()
    });

    message.info(`开始剪切【${ item.file.path } => ${ item.saveFile.path }】`);
  }
  // 停止任务
  onStopTask(item: Object, event: Event): void{
    const m = this.props.cutMap.get(item.id);
    m.child.kill();
  }
  render(): Array{
    const { getFieldDecorator }: { getFieldDecorator: Function } = this.props.form;  // 包装表单控件
    return [
      /* 功能区 */
      <Affix key={ 0 } className={ publicStyle.affix }>
        <div className={ `${ publicStyle.toolsBox } ${ style.toolsBox } clearfix` }>
          <div className={ publicStyle.fl }>
            <p className={ style.tishi }>提示：文件保存成“gif”格式可导出动图。</p>
            <Form layout="inline" onSubmit={ this.onAddQueue.bind(this) }>
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
                        <Button size="default" onClick={ this.onClickInput.bind(this, 'cut-file') }>选择视频文件</Button>
                        <span className={ style.path }>{ this.state.file ? this.state.file.path : '' }</span>
                        <input className={ style.disNone } id="cut-file" type="file" onChange={ this.onFileChange.bind(this) } />
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
                        <Button size="default" onClick={ this.onClickInput.bind(this, 'cut-save') }>选择保存位置</Button>
                        <span className={ style.path }>{ this.state.saveFile ? this.state.saveFile.path : '' }</span>
                        <input className={ style.disNone }
                               id="cut-save"
                               type="file"
                               nwsaveas=""
                               nwworkingdir={ this.dir }
                               onChange={ this.onSaveChange.bind(this) }
                        />
                      </div>
                    )
                  }
                </Form.Item>
              </div>
              <div className={ style.optGroup }>
                <Form.Item className={ `${ style.formItem } ${ style.timeGroup }` } label="开始时间">
                  {
                    getFieldDecorator('starthh', {
                      rules: [
                        {
                          message: '时间格式错误',
                          type: 'number',
                          min: 0,
                          transform: (value: string = ''): number=>Number(value)
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
                          transform: (value: string = ''): number=>Number(value)
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
                          transform: (value: string = ''): number=>Number(value)
                        }
                      ]
                    })(
                      <Input className={ style.input } />
                    )
                  }
                </Form.Item>
                <Form.Item className={ `${ style.formItem  } ${ style.end }`} label="结束时间">
                  {
                    getFieldDecorator('endhh', {
                      rules: [
                        {
                          message: '时间格式错误',
                          type: 'number',
                          min: 0,
                          transform: (value: string = ''): number=>Number(value)
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
                          transform: (value: string = ''): number=>Number(value)
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
                          transform: (value: string = ''): number=>Number(value)
                        }
                      ]
                    })(
                      <Input className={ style.input } />
                    )
                  }
                </Form.Item>
              </div>
              <div className={ style.optGroup }>
                <Form.Item>
                  <Button type="primary" htmlType="submit" size="default">添加到队列</Button>
                </Form.Item>
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
      <div key={ 1 } className={ `${ publicStyle.tableBox } ${ style.tableBox }` }>
        <Table loading={ this.state.loading }
          bordered={ true }
          columns={ this.columus() }
          rowKey={ (item: Object): number => item.id }
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

export default Cut;
