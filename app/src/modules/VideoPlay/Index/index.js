/**
 * 新窗口播放视频
 *
 * @flow
 */
import * as React from 'react';
import { Component } from 'react';
import { Card } from 'antd';
import flvjs from 'flv.js';
import style from './style.sass';
const queryString: Object = global.require('querystring');
const path: Object = global.require('path');

class Index extends Component<{}> {
  item: {
    title: string;
    subTitle: string;
    streamPath: string;
  };

  constructor(): void {
    super(...arguments);

    const search: string = location.search.replace(/^\?{1}/, ''); // 获取信息

    this.item = queryString.parse(search);
  }

  componentDidMount(): void {
    const type: string = path.parse(this.item.streamPath).ext.replace(/^\.{1}/, '');

    // 初始化flv.js
    if (flvjs.isSupported()) {
      const videoElement: HTMLElement | null = document.getElementById('video-element');

      if (videoElement) {
        const flvPlayer: flvjs = flvjs.createPlayer({
          type,
          url: this.item.streamPath
        });

        flvPlayer.attachMediaElement(videoElement);
        flvPlayer.load();
      }
    }
  }

  render(): React.Node {
    return (
      <Card className={ style.card } cover={
        <div className={ style.videobox }>
          <video className={ style.video } id="video-element" controls={ true } />
        </div>
      }>
        <Card.Meta className={ style.meta }
          title={
            <span>{ this.item.title }</span>
          }
          description={
            <span className={ style.subTitle }>{ this.item.subTitle }</span>
          }
        />
      </Card>
    );
  }
}

export default Index;