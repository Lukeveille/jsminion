import React, { useState, createContext, useContext, useEffect, useMemo } from 'react'
import axios from 'axios'
import api from './utils/api'

const authContext = createContext()

const Provider = ({ children }) => {
  const auth = useProvideAuth()
  return (
    <authContext.Provider value={auth}>
      {children}
    </authContext.Provider>
  )
}

const checkUser = async (cb) => {  
  const token = localStorage.getItem('jwt')
  const headers = { Authorization: `Bearer ${token}` }
  if (token) {
    return await axios.get(`${api}/users/me`, {headers}).then(res => res.data).catch(() => {
      localStorage.removeItem('jwt')
    })
  }
}

const useProvideAuth = () => {
  const [user, setUser] = useState(null)
  
  const token = localStorage.getItem('jwt')
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token])

  useEffect(() => {
    checkUser().then(user => setUser(user))
  }, [headers])
    
  const signin = (data, cb) => {
    const url = `${api}/auth/local`
    const method = 'POST'

    axios({url, method, data}).then(res => {
      localStorage.setItem('jwt', res.data.jwt)
      setUser(res.data.user)
      cb()
    })
  }

  const signout = (cb) => {
    setUser(null)
    localStorage.removeItem('jwt')
    cb()
  }

  const updateUser = (data, cb) => {
    setUser(data)
    cb()
  }

  return { user, headers, signin, signout, updateUser }
}

export const useAuth = () => useContext(authContext)

export default Provider;