import React from "react";
import { Route, BrowserRouter as Router } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/store";
import Train from "./views/Train";
import Test from "./views/Test";

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Route exact path="/" component={Train} />
        <Route exact path="/Test" component={Test} />
      </Router>
    </Provider>
  );
}

export default App;
