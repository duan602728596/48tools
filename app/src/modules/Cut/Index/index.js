/* 视频剪切 */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createSelector, createStructuredSelector } from 'reselect';
import { Link, withRouter } from 'react-router-dom';
import { Button, Table, Icon, Affix, message, Input } from 'antd';
import { time, patchZero } from '../../../function';
import { cutList } from '../store/render';
import style from './style.sass';
import publicStyle from '../../pubmicMethod/public.sass';
import commonStyle from '../../../common.sass';
const child_process = global.require('child_process');
const path = global.require('path');
const process = global.require('process');
const __dirname = path.dirname(process.execPath).replace(/\\/g, '/');

/* 初始化数据 */
const state = createStructuredSelector({
  cutList: createSelector(         // 剪切队列
    (state)=>state.get('cut').get('cutList'),
    (data)=>data
  ),
  cutMap: createSelector(          // 正在剪切
    (state)=>state.get('cut').get('cutMap'),
    (data)=>data
  )
});

/* dispatch */
const dispatch = (dispatch)=>({
  action: bindActionCreators({
    cutList
  }, dispatch)
});

@withRouter
@connect(state, dispatch)
class Cut extends Component{
  constructor(props){
    super(props);

    this.dir = `${ __dirname }/output`.replace(/\//g, '\\');
    this.state = {
      file: null,      // 选择文件
      saveFile: null,  // 保存文件
      starthh: '',     // 开始（时）
      startmm: '',     // 开始（分）
      startss: '',     // 开始（秒）
      endhh: '',       // 结束（时）
      endmm: '',       // 结束（分）
      endss: ''        // 结束（秒）
    };
  }
  componentDidMount(){
    // 为input添加nwsaveas属性
    const save = document.getElementById('cut-save');
    save.nwsaveas = '';
    save.nwworkingdir = this.dir;
  }
  // 选择文件的change事件
  onFileChange(event){
    const save = document.getElementById('cut-save');
    const file = event.target.files[0] || null;
    const { name, ext } = path.parse(file.path);
    const title = '【视频剪切】' + name + '_' + time('YY-MM-DD-hh-mm-ss') + ext;
    this.setState({
      file
    });
    save.nwsaveas = file ? title : '';
  }
  // 储存文件的change事件
  onSaveChange(event){
    const file = event.target.files[0] || null;
    this.setState({
      saveFile: file
    });
  }
  // inputChange
  onInputChange(key, event){
    this.setState({
      [key]: event.target.value
    });
  }
  // 添加到队列
  onAddQueue(event){
    const cutList = cutList.slice();
    const { file, saveFile, starthh, startmm, startss, endhh, endmm, endss } = this.state;
    cutList.push({
      file,
      saveFile,
      starthh,
      startmm,
      startss,
      endhh,
      endmm,
      endss
    });
    this.props.action.cutList({
      cutList
    });
  }
  render(){
    return(
      <div>
        <Affix>
          <div className={ `${ publicStyle.toolsBox } ${ commonStyle.clearfix }` }>
            {/* 功能区 */}
            <div className={ publicStyle.fl }>
              <div className={ style.optGroup }>
                <b>文件地址：</b>
                <Button className={ style.fBtn }>
                  <span>选择视频文件</span>
                  <label className={ style.fLabel } htmlFor="cut-file" />
                </Button>
                <span className={ style.path }>{ this.state.file ? this.state.file.path : '' }</span>
                <input className={ style.none }
                       id="cut-file"
                       type="file"
                       onChange={ this.onFileChange.bind(this) } />
              </div>
              <div className={ style.optGroup }>
                <b>开始时间：</b>
                <Input className={ style.input } onChange={ this.onInputChange.bind(this, 'starthh') } />
                <span className={ style.maohao }>:</span>
                <Input className={ style.input } onChange={ this.onInputChange.bind(this, 'startmm') } />
                <span className={ style.maohao }>:</span>
                <Input className={ style.input } onChange={ this.onInputChange.bind(this, 'startss') } />
              </div>
              <div className={ style.optGroup }>
                <b>结束时间：</b>
                <Input className={ style.input } onChange={ this.onInputChange.bind(this, 'endhh') } />
                <span className={ style.maohao }>:</span>
                <Input className={ style.input } onChange={ this.onInputChange.bind(this, 'endmm') } />
                <span className={ style.maohao }>:</span>
                <Input className={ style.input } onChange={ this.onInputChange.bind(this, 'endss') } />
              </div>
              <div className={ style.optGroup }>
                <b>保存地址：</b>
                <Button className={ style.fBtn }>
                  <span>选择保存位置</span>
                  <label className={ style.fLabel } htmlFor="cut-save" />
                </Button>
                <span className={ style.path }>{ this.state.saveFile ? this.state.saveFile.path : '' }</span>
                <input className={ style.none } id="cut-save" type="file" onChange={ this.onSaveChange.bind(this) } />
              </div>
              <div className={ style.optGroup }>
                <Button type="primary" onClick={ this.onAddQueue.bind(this) }>添加到队列</Button>
              </div>
            </div>
            <div className={ publicStyle.fr }>
              <Link className={ publicStyle.btnLink } to="/">
                <Button className={ publicStyle.ml10 } type="danger">
                  <Icon type="poweroff" />
                  <span>返回</span>
                </Button>
              </Link>
            </div>
          </div>
        </Affix>
      </div>
    );
  }
}

export default Cut;