//  @flow

import { createStore, applyMiddleware, compose } from "redux";
import { compact } from "lodash";
import { persistStore } from "redux-persist";
import createSagaMiddleware from "redux-saga";
import { createLogger } from "redux-logger";
import { composeWithDevTools } from "redux-devtools-extension";

import rootReducer from "./reducers";
import sagas from "./sagas";
import {REFRESH_CHAT_TIMESTAMPS} from '../modules/connections/actions';

export default function initializeStore(onError) {
  const sagaMiddleware = createSagaMiddleware();

  const middlewares = compact([
    sagaMiddleware,
    __DEV__ ? createLogger(
        {
          collapsed: (getState, action, logEntry) => !logEntry.error,
          predicate: (getState, action) => action.type && action.type.toLowerCase().includes("failed")
        }
    ) : null
  ]);

  const catchingReducer = (state, action) => {
    try {
      return rootReducer(state, action);
    } catch (e) {
      console.error(e);
      onError(e);
      return state;
    }
  };

  let debuggWrapper = data => data;
  if (__DEV__) {
    debuggWrapper = composeWithDevTools({
      realtime: true,
      port: 8081,
      suppressConnectErrors: false
    });
  }

  const store = createStore(
      catchingReducer,
    {},
    compose(debuggWrapper(applyMiddleware(...middlewares)))
  );

  const sagaTask = sagaMiddleware.run(sagas, store).toPromise();
  sagaTask.catch(onError);
  const persistor = persistStore(store, null, () => {
    store.getState();
  });

  return { store, persistor };
}
