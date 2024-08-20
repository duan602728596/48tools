import { ipcRenderer, type IpcRendererEvent } from 'electron';
import {
  useState,
  useEffect,
  type ReactElement,
  type Dispatch as D,
  type SetStateAction as S,
  type MouseEvent,
  type PropsWithChildren
} from 'react';
import { Button, Tooltip, Modal, Radio } from 'antd';
import type { RadioChangeEvent } from 'antd/es/radio';
import type { CheckboxOptionType } from 'antd/es/checkbox/Group';
import { SkinTwoTone as IconSkinTwoTone } from '@ant-design/icons';
import { WinIpcChannel } from '@48tools/main/src/channelEnum';
import ThemeContext from './ThemeContext';

localStorage.setItem('THEME_VALUE', globalThis?.__INITIAL_STATE__?.theme ?? 'system');

type ThemeValue = 'light' | 'dark' | 'system';

const themeOptions: Array<CheckboxOptionType<ThemeValue>> = [
  { label: '自动', value: 'system' },
  { label: '浅色主题', value: 'light' },
  { label: '暗黑主题', value: 'dark' }
];

interface ThemeProviderProps extends Required<PropsWithChildren>{
  isChildrenWindow?: boolean; // 是否为子窗口
}

/**
 * 切换主题
 * @param { boolean } [props.isChildrenWindow] - 子窗口的ui需要配置，监听来自副窗口的消息
 * @param { ReactNode } props.children - 子组件
 */
function ThemeProvider(props: ThemeProviderProps): ReactElement {
  const { children, isChildrenWindow }: ThemeProviderProps = props;
  const media: MediaQueryList = window.matchMedia('(prefers-color-scheme: dark)'); // 暗黑模式媒体查询
  const [themeMatches, setThemeMatches]: [boolean, D<S<boolean>>] = useState(media.matches); // 是否为暗黑模式
  const [theme, setTheme]: [ThemeValue, D<S<ThemeValue>>]
    = useState(localStorage.getItem('THEME_VALUE') as ThemeValue); // 当前使用的主题
  const [visible, setVisible]: [boolean, D<S<boolean>>] = useState(false); // 配置当前主题

  // 当前是暗黑模式
  const isDark: boolean = theme === 'dark' || (theme === 'system' && themeMatches);

  // media变化
  function handleMatchMediaChange(event: MediaQueryListEvent): void {
    setThemeMatches(event.matches);
  }

  // 打开配置
  function handleThemeModalOpenClick(event: MouseEvent): void {
    setVisible(true);
  }

  // 关闭配置
  function handleThemeModalCloseClick(event: MouseEvent): void {
    setVisible(false);
  }

  // 修改主题
  function handleThemeChange(event: RadioChangeEvent): void {
    const value: ThemeValue = event.target.value;

    ipcRenderer.send(WinIpcChannel.NativeThemeChange, value, true);
    setTheme(value);
  }

  const ChangeThemeElement: ReactElement = (
    <div>
      <Tooltip title="切换主题">
        <Button type="text" icon={ <IconSkinTwoTone /> } onClick={ handleThemeModalOpenClick } />
      </Tooltip>
      <Modal open={ visible }
        title="切换主题"
        width={ 380 }
        centered={ true }
        footer={ <Button onClick={ handleThemeModalCloseClick }>关闭</Button> }
        onCancel={ handleThemeModalCloseClick }
      >
        <div className="h-[35px] text-center">
          <Radio.Group optionType="button"
            buttonStyle="solid"
            options={ themeOptions }
            value={ theme }
            onChange={ handleThemeChange }
          />
        </div>
      </Modal>
    </div>
  );

  useEffect(function(): void {
    if (isDark) {
      document.body.setAttribute('theme', 'dark');
    } else {
      document.body.removeAttribute('theme');
    }
  }, [isDark]);

  useEffect(function(): void {
    if (isChildrenWindow) {
      ipcRenderer.on(WinIpcChannel.ThemeSource, function(event: IpcRendererEvent, value: ThemeValue): void {
        setTheme(value);
      });
    }
  }, []);

  useEffect(function(): () => void {
    media.addEventListener('change', handleMatchMediaChange, false);

    return function(): void {
      media.removeEventListener('change', handleMatchMediaChange, false);
    };
  }, [media]);

  return (
    <ThemeContext value={{ ChangeThemeElement, isDark }}>
      { children }
    </ThemeContext>
  );
}

export default ThemeProvider;