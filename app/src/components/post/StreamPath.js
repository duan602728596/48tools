import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Tag } from 'antd';
import { getLiveInfo } from './post';

/* streamPath地址渲染 */
class StreamPath extends Component {
  static propTypes = {
    liveId: PropTypes.string,
    isZhibo: PropTypes.bool
  };

  constructor() {
    super(...arguments);

    this.state = {
      streamPath: null
    };
  }

  async componentDidMount() {
    const liveInfo = await getLiveInfo(this.props.liveId);

    if (liveInfo.status === 200) {
      this.setState({
        streamPath: liveInfo.content.playStreamPath
      });
    }
  }

  async componentDidUpdate(prevProps, prevState) {
    if (this.props.liveId !== prevProps.liveId) {
      const liveInfo = await getLiveInfo(this.props.liveId);

      if (liveInfo.status === 200) {
        this.setState({
          streamPath: liveInfo.content.playStreamPath
        });
      }
    }
  }

  render() {
    const { isZhibo, liveId } = this.props;

    return [
      <div key="tag">
        <Tag color={ isZhibo ? 'magenta' : 'geekblue' }>{ liveId }</Tag>
      </div>,
      this.state.streamPath
    ];
  }
}

export default StreamPath;