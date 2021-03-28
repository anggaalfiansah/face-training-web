import React from "react";
import { Provider } from "react-redux";
import store from "./redux/store"
import Train from "./views/Train";

function App() {
  return (
    <Provider store={store}>
      <Train />
    </Provider>
  );
}

export default App;
