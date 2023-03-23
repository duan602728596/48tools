import { Component, type ReactElement, type FocusEventHandler } from 'react';
import { Select, type SelectProps } from 'antd';
import type { SelectHandler, DefaultOptionType } from 'rc-select/es/Select';
import style from './fixSelect.sass';

interface FixSelectState {
  open: boolean;
}

/* select搜索后不会重新render下拉列表的值，所以需要修复 */
class FixSelect extends Component<SelectProps, FixSelectState> {
  state: FixSelectState = {
    open: false
  };

  componentDidUpdate(prevProps: Readonly<SelectProps>, prevState: Readonly<{}>, snapshot?: any): void {
    // TODO: fix搜索源更新后下拉数据不更新的bug
    if (prevProps.options !== this.props.options) {
      this.setState({ open: false }, (): void => {
        this.setState({ open: true });
      });
    }
  }

  handleSelectForce: FocusEventHandler<HTMLElement> = (): void => {
    this.setState({ open: true });
  };

  handleSelectBlur: FocusEventHandler<HTMLElement> = (): void => {
    this.setState({ open: false });
  };

  handleSelect: SelectHandler<string, DefaultOptionType> = (value: string, option: DefaultOptionType): void => {
    this.props?.onSelect?.(value, option);
    this.setState({ open: false });
  };

  render(): ReactElement | null {
    return (
      <Select { ...this.props }
        className={ style.searchSelect }
        showSearch={ true }
        open={ this.state.open }
        onFocus={ this.handleSelectForce }
        onBlur={ this.handleSelectBlur }
        onSelect={ this.handleSelect }
      />
    );
  }
}

export default FixSelect;