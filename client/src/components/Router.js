import React from "react"
import { BrowserRouter, Route, Switch } from "react-router-dom"
import App from "./App"
import Unsubscribe from "./Unsubscribe"
import DirectUnsubscribe from "./DirectUnsubscribe"
import NotFoundPage from "./NotFoundPage"
import About from "./About"

const Router = () => (
  <BrowserRouter>
    <div>
      <Switch>
        <Route path="/" component={App} exact={true} />
        <Route path="/unsubscribe" component={Unsubscribe} exact={true} />
        <Route path="/unsubscribe/:id" component={DirectUnsubscribe} />
        <Route path="/about" component={About} />
        <Route component={NotFoundPage} />
      </Switch>
    </div>
  </BrowserRouter>
)

export default Router
