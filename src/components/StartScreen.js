import React from 'react';

export default props => (
  <div>
    <h2 className="title">Let's Play</h2>
    <h1>Dominion</h1>
    <div
      className="game-button start-button live"
      onClick={props.onClick}
    >
      Start Game
    </div>
  </div>
);
