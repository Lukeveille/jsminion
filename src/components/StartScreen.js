import React from 'react';

export default props => (
  <div>
    <h2 className="title">{props.phaseTitle}</h2>
    {props.start? <h1>Dominion</h1> : <p>{props.victory} Victory Points!</p>}
    <div
      className="game-button start-button live"
      onClick={props.onClick}
    >
      {props.button}
    </div>
  </div>
);
