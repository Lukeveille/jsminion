import React from 'react';
import ActionModal from '../components/ActionModal';
import { generateLog } from './printLog';
import hasType from './hasType';
import cleanup from './cleanup';
import playAction from './playAction';
import parseActionObject from './parseActionObject';

export default (card, turnObject, actionObject, setters) => {
  const actionLogName = [{name: `card${actionObject.modifier? ` from ${actionObject.modifier}` : ''}`}]
  if (actionObject.modifier && actionObject.modifier !== 'up-to') {
    let discardTrash = parseActionObject(card, actionObject.modifier)
    switch (actionObject.modifier) {
      case 'deck':
        if (turnObject.deck.length < 1) turnObject = {...turnObject, deck: turnObject.discard, discard: []};
        let removal = turnObject.deck.splice(discardTrash.index, actionObject.amount);
        const discard = () => {
          turnObject.discard = turnObject.discard.concat(removal);
          turnObject.logs = turnObject.logs.concat(generateLog(turnObject.gameState, actionLogName, 'discards', 1, true));
        };
        if (discardTrash.next[0] === 'modal' && removal.length > 0) {
          const cardLive = discardTrash.type === removal[0].type,
          decline = () => {
            turnObject.actions--;
            turnObject = cleanup(turnObject);
            if (turnObject.actions === 0) setters.setPhase('Buy');
            turnObject.hand.splice(turnObject.hand.findIndex(card => (card === removal[0])), 1);
            const endLog = turnObject.logs.pop();
            turnObject = {...turnObject,
              discard: turnObject.discard.concat(removal),
              logs: turnObject.logs.concat(generateLog(turnObject.gameState, actionLogName, 'discards', 1, true)).concat(endLog),
              menuScreen: null
            };
            setters.setTurnState(turnObject);
            setters.setDiscardTrashState(false);
          },
          accept = () => {
            turnObject.menuScreen = null;
            turnObject.hand = turnObject.hand.concat(removal[0]);
            turnObject = playAction(removal[0], 1, turnObject, setters);
            setters.setTurnState(turnObject);
          };
          if (cardLive) {
            turnObject.actions++;
            turnObject.menuScreen = (
              <ActionModal
                cards={removal}
                accept={accept}
                decline={decline}
                buttonText={actionObject.type}
                live={cardLive}
                title="You may play"
              />
            );
          } else if (removal.length > 0) {
            discard();
          };
        };
        break;
      default: break;
    };
  } else {
    let actionName = 'discards';
    let removal = turnObject.hand.findIndex(i => (i.name === actionObject.restriction));
    if (removal === -1) {
      turnObject.coinMod -= 3;
      turnObject.logs.pop();
    } else {
      if (actionObject.type === 'discard') {
        turnObject.discard = turnObject.discard.concat(turnObject.hand.splice(removal, actionObject.amount));
      } else {
        turnObject.trash = (turnObject.trash.concat(turnObject.hand.splice(removal, actionObject.amount)));
        actionName = 'trashes'
      };
      turnObject.logs = turnObject.logs.concat(generateLog(turnObject.gameState, actionLogName, actionName, actionObject.amount, true))
    };
  };
  const checkHand = !hasType(turnObject.hand, 'Action');
  return [turnObject, checkHand]
};
