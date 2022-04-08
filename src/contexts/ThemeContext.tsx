import React, { useCallback, createContext, useReducer } from 'react';
import { useLocalStorage } from 'react-use';

export const ThemeContext = createContext<any>(null);
const LOCAL_STORAGE_KEY = 'theme';

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

const usePersistReducer = () => {
  const [savedState, saveState] = useLocalStorage(LOCAL_STORAGE_KEY, initialState);
  const reducerLocalStorage = useCallback(
    (state, action) => {
      const newState = themeReducer(state, action);

      saveState(newState);

      return newState;
    },
    [saveState]
  );

  return useReducer(reducerLocalStorage, savedState);
};

export function ThemeProvider(props: any) {
  const [state, dispatch] = usePersistReducer();

  return <ThemeContext.Provider value={{ state, dispatch }}>{props!.children}</ThemeContext.Provider>;
}
