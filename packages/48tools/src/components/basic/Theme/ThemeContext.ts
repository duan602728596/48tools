import { createContext, type Context, type ReactElement } from 'react';

export interface Theme {
  ChangeThemeElement?: ReactElement;
  isDark?: boolean;
}

const ThemeContext: Context<Theme> = createContext({});

export default ThemeContext;