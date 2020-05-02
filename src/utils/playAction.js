import React from 'react';
import { generateLog } from './printLog';
import printLog from './printLog';
import parseActionObject from './parseActionObject';
import autoAction from './autoAction';
import moveCard from './moveCard';
import countValue from './countValue';
import rollover from './rollover';
import cleanup from './cleanup';
import hasType from './hasType';
import enterBuyPhase from './enterBuyPhase';
import ActionModal from '../components/ActionModal';

export default (card, size, turnObject, setters) => {
  let rolloverCards = [],
  actionSupply = false,
  newCards;
  turnObject.logs = turnObject.logs.concat(printLog(turnObject.gameState, [card]));
  turnObject.actions--;
  [turnObject.hand, turnObject.inPlay, newCards] = moveCard(card, size, turnObject.hand, turnObject.inPlay);
  turnObject.treasure += countValue(newCards, 'treasure');
  if (card.playMod) turnObject.playMod = parseActionObject(card, 'playMod');
  if (card.actions) turnObject.actions += card.actions;
  if (card.buys) turnObject.buys += card.buys;
  if (card.cards) {
    [rolloverCards, turnObject.deck, turnObject.discard] = rollover(card.cards, turnObject.deck, turnObject.discard);
    if (rolloverCards.length > 0) {
      turnObject.hand = turnObject.hand.concat(rolloverCards);
    } else {
      turnObject.logs.pop();
    };
  };
  const discardTrashObject = card.discardTrash? parseActionObject(card, 'discardTrash') : false;
  let checkHandForActions = !hasType(turnObject.hand, 'Action');
  if (discardTrashObject) {
    if (discardTrashObject.next && discardTrashObject.next[0] === 'auto') {
      [turnObject, checkHandForActions] = autoAction(card, turnObject, discardTrashObject, setters);
    } else {
      checkHandForActions = false;
      setters.setDiscardTrashState(discardTrashObject);
    };
  } else if (card.supply) {
    const supplyMsg = parseActionObject(card, 'supply');
    actionSupply = {
      treasure: turnObject.treasure,
      count: 1,
      destination: supplyMsg.next && supplyMsg.next[0]? supplyMsg.next[0] : 'discard'
    };
    turnObject.treasure = supplyMsg.amount;
  } else if (card.discard) {
    const discardInfo = parseActionObject(card, 'discard');

    switch (discardInfo.type) {
      case 'modal':
        if (turnObject.discard.length > 0) {
          turnObject.menuScreen = (
            <ActionModal
              cards={turnObject.discard}
              accept={card => {
                [turnObject.discard, turnObject.deck] = moveCard(card, discardInfo.amount, turnObject.discard, turnObject.deck);
                turnObject.logs = turnObject.logs.concat(generateLog(turnObject.gameState, [{name: 'discard to deck'}], 'moves', discardInfo.amount, true));
                turnObject.menuScreen = false;
                turnObject = cleanup(turnObject);
                setters.setTurnState(turnObject);
              }}
              decline={() => {
                setters.setTurnState({...turnObject, menuScreen: false });
              }}
              buttonText={'Decline'}
              live={true}
              title={`Choose ${discardInfo.amount} to move from discard to deck`}
            />
          );
        };
        break;
      default: break;
    };
  };
  let auto = discardTrashObject? (discardTrashObject.next && discardTrashObject.next[0] === 'auto')? true : false : true;
  auto = turnObject.menuScreen? false : auto;
  if ((!turnObject.actions || checkHandForActions) && auto && !actionSupply) {
    [turnObject.logs, turnObject.phase, turnObject.actions] = enterBuyPhase(turnObject.gameState, turnObject.logs);
  };
  setters.setActionSupply(actionSupply);
  return turnObject;
};
