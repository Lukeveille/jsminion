import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import styles from '../styles/lobby.module.css'
import { useAuth } from '../Provider';

export default () => {
  const [lobby, setLobby] = useState(false);
  const newGameId = uuidv4().slice(0, 8);
  const auth = useAuth();
  const history = useHistory();

  return (
    <div className={styles['lobby-screen']}>
        <span>{auth.user}</span>
        <button onClick={auth.signOut}>Sign Out</button>
      <table className={`${styles.players} ${styles.table}`}>
        <thead className={styles.liner}>
          <tr>
            <td className={styles.spaced}>Online</td>
            <td className={styles.spaced}>Invite/Join</td>
            <td className={styles.spaced}>Status</td>
            <td className={styles.spaced}></td>
          </tr>
          <tr> 
            <td colSpan="4"> <hr /> </td>      
          </tr>
        </thead>
      </table>
      <div className={styles['lobby-full']}>
        {lobby? <table className={`${styles.lobby} ${styles.table}`}>
          <thead className={styles.liner}>
            <tr>
              <td className={styles.spaced}>Lobby</td>
              <td className={styles.spaced}></td>
              <td className={styles.spaced}></td>
              <td className={styles['double-spaced']}></td>
            </tr>
            <tr> 
              <td colSpan="4"> <hr /> </td>      
            </tr>
          </thead>
        </table> : ''}
        <div className={styles['button-box']}>
          {/* <Link to="/deck-builder"> */}
            <div className={`${styles.button} ${styles.short}`}>
              Choose Deck
            </div>
          {/* </Link> */}
          <div 
            className={`${styles.button} ${styles.short}`}
            onClick={() => setLobby(lobby? false : newGameId)}
          >
            {lobby? 'Leave' : 'Create'} Lobby
          </div>
        </div>
        {lobby? 
          <div
            className={`${styles.button} ${styles.long}`}
            onClick={() => history.push(`/${newGameId}`)}
          >
            Start Game
          </div> : ''}
      </div>
    </div>
  )
}
