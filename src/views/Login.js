import React, { useState } from 'react';
import styles from '../styles/login.module.css'

export default ({setUser, inputRef}) => {
  const [userLogin, setUserLogin] = useState('');

  // useEffect(() => {
  //   inputRef.current.focus();
  // })

  return (
    <div className={styles['login-screen']}>
      <form
        onSubmit={e => {
          e.preventDefault();
          setUser(userLogin);
        }}
      >
        <h3>Enter a Username</h3>
        <input
          ref={inputRef}
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
          onClick={() => setUser(userLogin)}
        >Submit</div>
      </form>
    </div>
  )
}
