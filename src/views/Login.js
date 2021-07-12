import React, { useState } from 'react';
import { useHistory } from 'react-router';
import styles from '../styles/login.module.css'
import { useAuth } from '../Provider';

export default () => {
  const [userLogin, setUserLogin] = useState({ identifier: '', password: ''});
  const { signIn } = useAuth();
  const { push } = useHistory();

  return (
    <div className={styles['login-screen']}>
      <form
        onSubmit={e => {
          e.preventDefault();
          signIn(userLogin, () => push('/'));
        }}
      >
        <h3>Enter Your Username</h3>
        <input
          className={styles['username-input']}
          value={userLogin.identifier}
          onChange={ ({ target: { value } }) => {
            if (value.length < 15) {
              setUserLogin({...userLogin, identifier: value });
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
          type="password"
          className={styles['username-input']}
          value={userLogin.password}
          onChange={e => {
            if (e.target.value.length < 15) {
              setUserLogin({...userLogin, password: e.target.value });
            }
          }}
          onKeyDown={e => {
            if (e.keyCode === 32 || e.keyCode === 219 || e.keyCode === 221) {
              e.preventDefault();
            }
          }}
        />
        <button
          className={`${styles.button} ${userLogin? styles.active : ''}`}
          type="submit"
        >
          Submit
        </button>
      </form>
    </div>
  )
}
