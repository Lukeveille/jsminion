import React from 'react'
import { Redirect, Route } from 'react-router-dom'
import { useAuth } from './Provider'

const RouteConfig = ({
  component: Component,
  fullLayout,
  noAuth,
  ...rest
}) => {
  const auth = useAuth()
  
  return <Route
    {...rest}
    render={props => {
      return (
        noAuth && auth.user? <Redirect to={{ pathname: '/', state: { from: props.location }}} />
        :
        auth.user || noAuth ? <Component {...props}></Component>
        :
        <Redirect to={{ pathname: '/login', state: { from: props.location }}} />
      )
    }}
  />
}

export default RouteConfig