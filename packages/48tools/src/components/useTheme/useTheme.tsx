import { Fragment, useState, ReactElement, ReactPortal, Dispatch as D, SetStateAction as S } from 'react';
import { createPortal } from 'react-dom';
import { Button, Tooltip } from 'antd';
import { SkinTwoTone as IconSkinTwoTone } from '@ant-design/icons';

export const LOCALSTORAGE_THEME_NAME: string = 'THEME_VALUE';

type ThemeValue = 'light' | 'dark' | 'system';

export interface UseThemeReturn {
  ChangeThemeElement: ReactElement;
  DarkStylesheetElement: ReactPortal | null;
}

/* 软件切换主题 */
function useTheme(): UseThemeReturn {
  const media: MediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');  // 暗黑模式媒体查询
  const [darkMatches, setDarkMatches]: [boolean, D<S<boolean>>] = useState(media.matches); // 是否为暗黑模式
  const [theme, setTheme]: [ThemeValue, D<S<ThemeValue>>]
    = useState((localStorage.getItem(LOCALSTORAGE_THEME_NAME) ?? 'light') as ThemeValue);  // 当前使用的主题

  return {
    ChangeThemeElement: (
      <Fragment>
        <Tooltip title="主题切换">
          <Button type="text" icon={ <IconSkinTwoTone /> } />
        </Tooltip>
      </Fragment>
    ),
    DarkStylesheetElement: (theme === 'dark' || (theme === 'system' && darkMatches)) ? createPortal(
      <link rel="stylesheet" href={ require('@48tools/dark-theme/dist/antd-dark.min.css').default } />,
      document.body
    ) : null
  };
}

export default useTheme;