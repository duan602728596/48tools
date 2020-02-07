/**
 * 新窗口播放视频
 */
import React, { Component } from 'react';
import { Card, Tag } from 'antd';
import flvjs from 'flv.js';
import style from './style.sass';
import option from '../../../components/option/option';
const queryString = global.require('querystring');
const childProcess = global.require('child_process');

export function child_process_stdout(data) {
  // console.log(data.toString());
}

export function child_process_stderr(data) {
  // console.log(data.toString());
}

export function child_process_exit(code, data) {
  console.log('exit: ' + code + ' ' + data);
  child_process_cb();
}

export function child_process_error(err) {
  console.error('error: \n' + err);
  child_process_cb();
}

class Index extends Component {
  constructor() {
    super(...arguments);

    const search = location.search.replace(/^\?{1}/, ''); // 获取信息

    this.item = queryString.parse(search);
    this.child = null;
    this.serverId = Math.floor(Math.random() * 1000000);
  }

  componentDidMount() {
    const { id } = this.item;

    this.childProcsssInit();

    // 初始化flv.js
    if (flvjs.isSupported()) {
      const videoElement = document.getElementById('video-element');
      const flvPlayer = flvjs.createPlayer({
        type: 'flv',
        isLive: true,
        url: `http://localhost:15001/live/${ this.serverId }.flv`
      });

      flvPlayer.attachMediaElement(videoElement);
      flvPlayer.load();
    }
  }

  // 初始化录制
  childProcsssInit() {
    const { streamPath, liveType } = this.item;
    const args = [
      '-re',
      '-i',
      streamPath,
      '-c:v',
      'libx264',
      '-preset',
      'superfast',
      '-tune',
      'zerolatency',
      '-c:a',
      'aac',
      '-ar',
      '44100',
      '-f',
      'flv',
      `rtmp://localhost:15000/live/${ this.serverId }`
    ];

    this.child = childProcess.spawn(option.ffmpeg, args);

    this.child.stdout.on('data', child_process_stdout);
    this.child.stderr.on('data', child_process_stderr);
    this.child.on('close', child_process_exit);
    this.child.on('error', child_process_error);
  }

  render() {
    const { title, nickname, liveType, streamPath } = this.item;
    const isZhibo = Number(liveType) === 1;

    return (
      <Card className={ style.card } cover={
        <div className={ style.videobox }>
          <video className={ style.video } id="video-element" controls={ true } />
        </div>
      }>
        <Card.Meta className={ style.meta }
          title={ <b key="title" className={ style.title }>{ title }</b> }
          description={
            [
              <span key="nickname" className={ style.nickname }>{ nickname }</span>,
              <Tag key="liveType" color={ isZhibo ? '#f50' : '#2db7f5' }>{ isZhibo ? '直播' : '电台' }</Tag>,
              <p key="tishi" className={ style.tishi }>如果加载比较慢，表示视频在转码，请耐心等待。</p>
            ]
          }
        />
      </Card>
    );
  }
}

export default Index;