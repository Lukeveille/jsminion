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

// const checkUser = async (headers) => {  
//   if (headers) {
//     return await axios.get(`${api}/users/me`, {headers}).then(res => res.data).catch(() => {
//       localStorage.removeItem('user')
//     })
//   }
// }

const useProvideAuth = () => {
  const [user, setUser] = useState(localStorage.getItem('user'))
  // const headers = useMemo(() => ({ Authorization: `Bearer ${user?.token}` }), [user?.token])

  // useEffect(() => {
  //   checkUser(headers).then(user => setUser(user))
  // }, [headers])
    
  const signIn = (data, cb) => {
    // const url = `${api}/auth/local`
    // const method = 'GET'
    // axios({url: '/v2/pokemon/ditto', method, data}).then(res => {
    //   console.log(res)
    
    localStorage.setItem('user', data)
    setUser(data)
    // cb()
    // })
  }

  const signOut = (cb) => {
    setUser(null)
    localStorage.removeItem('user')
    // cb()
  }

  // const updateUser = (data, cb) => {
  //   setUser(data)
  //   cb()
  // }

  return { user, signIn, signOut }
  // return { user, signIn, signOut, headers }
}

export const useAuth = () => useContext(authContext)

export default Provider;
