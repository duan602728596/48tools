import React, { Component, useState } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createSelector, createStructuredSelector } from 'reselect';
import { Icon, Checkbox, Switch } from 'antd';
import style from './style.sass';
import { test } from '../store/reducer';
import '../../../components/indexedDB/initIndexedDB';
import { handleOpenBrowser } from '../../../utils';
import Navs from './Navs';

/* 升级提示组件 */
function UpgradeReminder(props) {
  const upgradeReminder = localStorage.getItem('upgradeReminder');
  const [isUpgradeReminder, setUpgradeReminder] = useState(
    upgradeReminder === 'true' || !upgradeReminder
  );

  // 状态变化
  function handleUpgradeReminderChange(event) {
    localStorage.setItem('upgradeReminder', String(!isUpgradeReminder));

    setUpgradeReminder(!isUpgradeReminder);
  }

  return (
    <div className={ style.update }>
      <Switch checked={ isUpgradeReminder } onChange={ handleUpgradeReminderChange } />
      <label className={ style.updateLabel }>软件升级提醒</label>
    </div>
  );
}

/* 初始化数据 */
const state = createStructuredSelector({
  test: createSelector(
    (state) => state.get('index'),
    (data) => data.get('test')
  )
});

/* dispatch */
const dispatch = (dispatch) => ({
  action: bindActionCreators({
    test
  }, dispatch)
});

@connect(state, dispatch)
class Index extends Component {
  static propTypes = {
    test: PropTypes.bool,
    action: PropTypes.objectOf(PropTypes.func)
  };

  // check
  handleCheckChange(event) {
    this.props.action.test({
      test: event.target.checked
    });
  }

  render() {
    return (
      <div className={ style.body }>
        <h1 className={ style.title }>48应援工具</h1>
        <p className={ style.text }>
          本软件遵循
          <b>GNU General Public License v3.0</b>
          许可证，非商用，如有问题请发送到邮箱duanhaochen@126.com。
        </p>
        <p className={ style.text }>
          源代码托管地址：
          <Icon type="github" theme="filled" />
          <a className={ style.url }
            onClick={ handleOpenBrowser.bind(this, 'https://github.com/duan602728596/48tools') }
          >
            https://github.com/duan602728596/48tools
          </a>
          。
        </p>
        <div className={ style.test }>
          <Checkbox checked={ this.props.test } onChange={ this.handleCheckChange.bind(this) }>
            <span>显示测试功能。（某些功能正在测试，功能不稳定）</span>
          </Checkbox>
        </div>
        <UpgradeReminder />
        <Navs test={ this.props.test } />
      </div>
    );
  }
}

export default Index;