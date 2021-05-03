import React from 'react'
import { Redirect, Route } from 'react-router-dom'
import { useAuth } from './Provider'
import Spinner from './components/Spinner'

const RouteConfig = ({
  component: Component,
  fullLayout,
  noAuth,
  ...rest
}) => {

  const auth = useAuth()
  const token = localStorage.getItem('jwt')
  
  return <Route
    {...rest}
    render={props => {
      return (
        noAuth && auth.user? <Redirect to={{ pathname: '/', state: { from: props.location }}} /> :
        
        (token && auth.user) || noAuth? <Component {...props}></Component> :

        token && !auth.user? <Spinner /> :
        
        <Redirect to={{ pathname: '/login', state: { from: props.location }}} />
      )
    }}
  />
}

export default RouteConfig