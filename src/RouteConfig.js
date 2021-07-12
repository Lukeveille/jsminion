import React from 'react'
import { Redirect, Route } from 'react-router-dom'
import { useAuth } from './Provider'

const RouteConfig = ({
  component: Component,
  fullLayout,
  noAuth,
  ...rest
}) => {
  const { currentUser } = useAuth();
  
  return <Route
    {...rest}
    render={props => {
      return (
        noAuth && currentUser ? <Redirect to={{ pathname: '/', state: { from: props.location }}} />
        :
        noAuth || currentUser ? <Component {...props}></Component>
        :
        <Redirect to={{ pathname: '/login', state: { from: props.location }}} />
      )
    }}
  />
}

export default RouteConfig;
