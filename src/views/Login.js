import React, { useState } from 'react';
import styles from '../styles/login.module.css'
import { useAuth } from '../Provider';

export default ({inputRef}) => {
  const [userLogin, setUserLogin] = useState('');
  const auth = useAuth();

  return (
    <div className={styles['login-screen']}>
      <form
        onSubmit={e => {
          e.preventDefault();
          auth.signIn(userLogin);
          console.log(auth.user)
        }}
      >
        <h3>Enter Your Username</h3>
        <input
          className={styles['username-input']}
          value={userLogin}
          onChange={e => {
            if (e.target.value.length < 15) {
              setUserLogin(e.target.value);
            }
          }}
          onKeyDown={e => {
            if (e.keyCode === 32 || e.keyCode === 219 || e.keyCode === 221) {
              e.preventDefault();
            }
          }}
        />
        <input
          placeholder="Password"
          className={styles['username-input']}
          value={userLogin}
          onChange={e => {
            if (e.target.value.length < 15) {
              setUserLogin(e.target.value);
            }
          }}
          onKeyDown={e => {
            if (e.keyCode === 32 || e.keyCode === 219 || e.keyCode === 221) {
              e.preventDefault();
            }
          }}
        />
        <div
          className={`${styles.button} ${userLogin? styles.active : ''}`}
          onClick={() => auth.signIn(userLogin)}
        >Submit</div>
      </form>
    </div>
  )
}
