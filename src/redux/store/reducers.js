// @flow

import { persistCombineReducers } from "redux-persist";
import { chat, auth, educational, profile, connections, appointments,payment, revamp } from "./../modules";
import KeyValueStorage from "react-native-key-value-storage";

const storage = KeyValueStorage;
storage.setItem = KeyValueStorage.set;
storage.getItem = KeyValueStorage.get;
const config = {
  key: "LIFTED_REDUX_STORE",
  storage
};

const appReducer = persistCombineReducers(config, {
  chat,
  auth,
  educational,
  profile,
  connections,
  appointments,
  payment,
  revamp
});

export default function rootReducer(state, action) {
  return appReducer(state, action);
}
