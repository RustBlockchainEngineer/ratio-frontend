import React, { createContext, useReducer } from 'react';

export const ThemeContext = createContext<any>(null);

const initialState = {
  darkMode: false,
};

const themeReducer = (state: any, action: any) => {
  switch (action.type) {
    case 'LIGHTMODE':
      return { darkMode: false };
    case 'DARKMODE':
      return { darkMode: true };
    default:
      return state;
  }
};

export function ThemeProvider(props: any) {
  const [state, dispatch] = useReducer(themeReducer, initialState);

  return <ThemeContext.Provider value={{ state, dispatch }}>{props!.children}</ThemeContext.Provider>;
}
