import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { getLiveInfo } from '../../../components/post/post';

class StreamPath extends Component {
  static propTypes = {
    liveId: PropTypes.string
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
    return this.state.streamPath;
  }
}

export default StreamPath;