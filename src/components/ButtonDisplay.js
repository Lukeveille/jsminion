import React from 'react';
import instructions from '../utils/instructions';
import treasureInHand from '../utils/treasureInHand';

export default props => {
  const noLimit = props.discardTrashState && (props.discardTrashState.modifier === 'up-to' || props.discardTrashState.amount === 'any'),
  rightAmount = props.discardTrashState && props.discardTrashState.amount === props.discardTrashQueue.length;

  return (
    <div className="button-display">
      <div>
        <div className="game-button red">{props.phase? `Your Turn - ${props.phase} Phase` : `P2's Turn`}</div>
        <p className="instructions red">{instructions(props.phase, props.buys, props.discardTrashState, props.actionSupply)}&nbsp;</p>
  
        {props.actionSupply? '' : <div>
          <div
            className={props.discardTrashState || !props.phase? 'hidden' : treasureInHand(props.hand) > 0 && props.phase === 'Buy'? `game-button live` : 'button-space'}
            onClick={props.playAllTreasure}
          >
            {treasureInHand(props.hand) > 0 && props.phase === 'Buy'? `Play All Treasure (${treasureInHand(props.hand)})` : ' '}
          </div>
          <div
            className={`game-button ${props.discardTrashState? noLimit || rightAmount? '' : 'not-' : ''}live${props.discardTrashState || !props.phase? '' : ' top-spaced'}`}
            onClick={props.discardTrashState? noLimit || rightAmount? props.discardTrashCards : () => {} : props.nextPhase}
          >
            {props.discardTrashState? `Confirm Card${isNaN(props.discardTrashState.amount) || props.discardTrashState.amount > 1? 's' : ''} to ${props.discardTrashState.type} (${props.discardTrashQueue.length})` : props.phase? `End ${props.phase} Phase` : 'Start Turn'}
          </div>
          <div
            className={`game-button live top-spaced ${(props.discardTrashState && props.discardTrashQueue.length > 0)? '' : ' hidden'}`}
            onClick={() => {props.setDiscardTrashQueue([])}}
          >
            {`Choose different cards`}
          </div>
        </div>}
      </div>
      <div>
        <div className="breakline"/>
        <div className="deck">
          <p>Deck ({props.deck.length})</p>
        </div>
        <div
          className={`deck ${props.discard.length > 0? 'active' : ''}`}
          onClick={() => {
            if (props.discard.length > 0) {
              props.setModalContent([props.discard, 'Discard']);
              props.setShowModal(true);
            };
          }}
        >
          <p>Discard ({props.discard.length})</p>
        </div>
      </div>
    </div>
  );
};
