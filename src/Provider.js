import React, { useState, createContext, useEffect, useContext, useMemo } from 'react';
import axios from 'axios';

const authContext = createContext();

const Provider = ({ children }) => {
  const auth = useProvideAuth()
  return (
    <authContext.Provider value={auth}>
      {children}
    </authContext.Provider>
  )
}

const useProvideAuth = () => {
  const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('user')));
  const headers = useMemo(() => ({ Authorization: `Bearer ${currentUser?.jwt}` }), [currentUser]);

  useEffect(() => {
    (async () => {
      await axios.get('/users/me', { headers }).then(res => res.data).catch(err => {
        localStorage.removeItem('user');
      })
    })()
  }, [headers])

  const signIn = async (data, cb) => {
    const url = '/auth/local';
    const method = 'POST';
    const { data: { user, jwt } } = await axios({ url, method, data })
    user.jwt = jwt;

    setCurrentUser(user);
    localStorage.setItem('user', JSON.stringify(user));
    cb();
  }

  const signOut = (cb) => {
    setCurrentUser(null);
    localStorage.removeItem('user');
    cb();
  }

  return { currentUser, signIn, signOut, headers }
}

export const useAuth = () => useContext(authContext)

export default Provider;
