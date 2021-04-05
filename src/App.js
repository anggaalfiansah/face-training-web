import React from "react";
import { Route, BrowserRouter as Router } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/store";
import Train from "./views/Train";
import Test from "./views/Test";
import CheckIn from "./views/CheckIn";
import CheckOut from "./views/CheckOut";

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Route exact path="/" component={Train} />
        <Route exact path="/Test" component={Test} />
        <Route exact path="/CheckIn" component={CheckIn} />
        <Route exact path="/CheckOut" component={CheckOut} />
      </Router>
    </Provider>
  );
}

export default App;
