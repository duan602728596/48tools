import {
  Fragment,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactElement,
  type MouseEvent,
  type RefObject,
  type Dispatch as D,
  type SetStateAction as S
} from 'react';
import { useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { Button, Card, Tag, Popover, Tooltip } from 'antd';
import {
  PlayCircleTwoTone as IconPlayCircleTwoTone,
  StopFilled as IconStopFilled,
  DeleteFilled as IconDeleteFilled,
  DownOutlined as IconDownOutlined,
  UpOutlined as IconUpOutlined
} from '@ant-design/icons';
import { red, orange, green } from '@ant-design/colors';
import VirtualList from 'rc-virtual-list';
import classNames from 'classnames';
import style from './processItemRender.sass';
import { setDeleteProcess } from '../../reducers/FFmpegProcess';
import type { ProcessItem, ProcessItemConsole } from '../../types';

/* 渲染status */
function statusRender(item: ProcessItem): ReactElement | undefined {
  switch (item.status) {
    case 'error':
      return <Tag color={ red.primary }>错误</Tag>;

    case 'stop':
      return <Tag color={ orange.primary }>停止</Tag>;

    case 'running':
      return <Tag color={ green.primary }>运行中</Tag>;
  }
}

/* 渲染log的单行 */
interface ConsoleItemProps {
  ref?: RefObject<HTMLParagraphElement | null>;
  item: ProcessItemConsole;
}

function ConsoleItem(props: ConsoleItemProps): ReactElement {
  const { ref, item }: ConsoleItemProps = props;
  const [height, setHeight]: [number, D<S<number>>] = useState(18);
  const spanRef: RefObject<HTMLSpanElement | null> = useRef(null);
  const resizeObserverRef: RefObject<ResizeObserver | null> = useRef(null);

  function handleResizeObserverCallback(entries: ResizeObserverEntry[], observer: ResizeObserver): void {
    const newHeight: number = entries[0].contentRect.height + 4;

    if (newHeight > 18) {
      setHeight((prevState: number): number => newHeight);
    }
  }

  useEffect(function(): void {
    if (spanRef.current) {
      const newHeight: number = spanRef.current!.getBoundingClientRect().height + 4;

      if (newHeight > 18) {
        setHeight((prevState: number): number => newHeight);
      }
    }
  }, []);

  useEffect(function(): () => void {
    resizeObserverRef.current = new ResizeObserver(handleResizeObserverCallback);
    spanRef.current && resizeObserverRef.current.observe(spanRef.current);

    return function(): void {
      resizeObserverRef.current?.disconnect?.();
      resizeObserverRef.current = null;
    };
  }, []);

  return (
    <p ref={ ref } className="my-0 py-[4px]" style={{ height }}>
      <span ref={ spanRef } className="block">{ item.text }</span>
    </p>
  );
}


interface ProcessItemRenderProps {
  index: number;
  item: ProcessItem;
  onReStart(item): void;
}

/* 渲染单个进程 */
function ProcessItemRender(props: ProcessItemRenderProps): ReactElement {
  const { index, item, onReStart }: ProcessItemRenderProps = props;
  const dispatch: Dispatch = useDispatch();
  const [consoleDisplay, setConsoleDisplay]: [boolean, D<S<boolean>>] = useState(true); // 是否显示log
  const virtualListRef: RefObject<any> = useRef(null);
  const inRunning: boolean = item.status === 'running';

  // 停止
  const handleStopClick: (event: MouseEvent) => void = useCallback(function(event: MouseEvent): void {
    if (item.status !== 'running') return;

    item.worker.postMessage({ item: { id: item.id }, type: 'stop' });
  }, [item.id, item.status]);

  // 删除
  const handleDeleteClick: (event: MouseEvent) => void = useCallback(function(event: MouseEvent): void {
    if (item.status === 'running') return;

    dispatch(setDeleteProcess(item.id));
  }, [item.id, item.status]);

  return (
    <Card className="mb-[6px]"
      size="small"
      title={
        <Fragment>
          <Popover placement="bottom" content={
            <div className="p-[8px] w-[400px] h-[200px] overflow-auto">
              ffmpeg&nbsp;
              { item.args }
            </div>
          }>
            <Button className="mr-[8px]" size="small">命令</Button>
          </Popover>
          { statusRender(item) }
        </Fragment>
      }
      extra={ [
        <Tooltip key="collapse" title={ consoleDisplay ? '隐藏输出' : '显示输出' }>
          <Button className="mr-[16px]"
            size="small"
            shape="circle"
            icon={ consoleDisplay ? <IconUpOutlined /> : <IconDownOutlined /> }
            onClick={ (event: MouseEvent): void => setConsoleDisplay(!consoleDisplay) }
          />
        </Tooltip>,
        <Button.Group key="action-griup" size="small">
          <Button icon={ <IconPlayCircleTwoTone /> }
            disabled={ inRunning }
            onClick={ (event: MouseEvent): void => onReStart(item) }
          >
            重新执行
          </Button>
          {
            inRunning
              ? <Button type="primary" danger={ true } icon={ <IconStopFilled /> } onClick={ handleStopClick }>停止</Button>
              : <Button type="primary" danger={ true } icon={ <IconDeleteFilled /> } onClick={ handleDeleteClick }>删除</Button>
          }
        </Button.Group>
      ] }
    >
      {
        consoleDisplay && (
          <VirtualList ref={ virtualListRef }
            className={ classNames('relative h-[200px] overflow-hidden text-[12px]', style.virtualList) }
            style={{ zIndex: index + 1 }}
            component="pre"
            itemKey="key"
            data={ item.console }
            height={ 200 }
            itemHeight={ 18 }
          >
            { (o: ProcessItemConsole): ReactElement => <ConsoleItem key={ o.key } item={ o } /> }
          </VirtualList>
        )
      }
    </Card>
  );
}

export default ProcessItemRender;