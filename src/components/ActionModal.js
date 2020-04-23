import React from 'react';
import capital from '../utils/capital';
import CardDisplay from './CardDisplay';

export default props => {
  return <div>
    <CardDisplay
      altKey={props.altKey}
      onClick={props.accept}
      cards={props.cards}
      live={props.live}
      title={props.live? 'You may play' : `To ${props.buttonText}`}
    />
    <div
      className="game-button start-button live"
      onClick={props.decline}
    >
      {capital(props.buttonText)}
    </div>
  </div>
};