import { createContext, type Context, type ReactElement } from 'react';

export interface Theme {
  ChangeThemeElement?: ReactElement;
}

const ThemeContext: Context<Theme> = createContext({});

export default ThemeContext;