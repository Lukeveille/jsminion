import React, { lazy } from "react"
import { BrowserRouter as Router, Switch } from "react-router-dom"
import AppRoute from "./RouteConfig"

const login = lazy(() => import("./views/Login"))
const lobby = lazy(() => import("./views/Lobby"))
const game = lazy(() => import("./views/Game"))


class AppRouter extends React.Component {
  render() {
    return (
      <Router>
        <Switch>
          <AppRoute path="/login" component={login} noAuth />
          <AppRoute path="/:gameId" component={game} noAuth />
          <AppRoute path="/" component={lobby} />
        </Switch>
      </Router>
    )
  }
}

export default AppRouter;
