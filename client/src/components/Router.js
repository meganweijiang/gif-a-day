import React from 'react';
import { BrowserRouter, Route, Switch, Link, NavLink } from 'react-router-dom';
import App from './App';
import Unsubscribe from './Unsubscribe';

const Router = () => (
  <BrowserRouter>
    <div>
      <Switch>
        <Route path="/" component={App} exact={true} />
        <Route path="/unsubscribe" component={Unsubscribe} />
      </Switch>
    </div>
  </BrowserRouter>
);

export default Router;
