import { createContext, Context, ReactElement, ReactPortal } from 'react';

export interface Theme {
  ChangeThemeElement?: ReactElement;
}

const ThemeContext: Context<Theme> = createContext({});

export default ThemeContext;