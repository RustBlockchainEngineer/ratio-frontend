import { combineReducers, createStore } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { devToolsEnhancer } from 'redux-devtools-extension';
import { CounterReducer } from './features/counter';
import { WalletReducer } from './features/wallet';
import { DashboardReducer } from './features/dashboard';

/* Create root reducer, containing all features of the application */
const rootReducer = combineReducers({
  count: CounterReducer,
  wallet: WalletReducer,
  dashboard: DashboardReducer,
});

const persistConfig = {
  key: 'root',
  storage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// const store = createStore(persistedReducer, /* preloadedState, */ devToolsEnhancer({}));

export default () => {
  const store = createStore(persistedReducer, /* preloadedState, */ devToolsEnhancer({}));
  const persistor = persistStore(store);
  return { store, persistor };
};
