import React from 'react';
import ActionModal from '../components/ActionModal';
import { generateLog } from './printLog';
import hasAction from './hasAction';

export default (card, turnObject, actionObject, setMenuScreen, setDiscardTrashState) => {
  if (actionObject.modifier && actionObject.modifier !== 'up-to') {
    switch (actionObject.modifier) {
      case 'deck':
        let discardTrash = card.deck.split(' ');
        discardTrash = {
          index: discardTrash[0],
          next: discardTrash[1],
          type: discardTrash[2]
        };
        let removal = turnObject.deck.splice(discardTrash.index, actionObject.amount);
        const decline = () => {
          setMenuScreen(null);
          turnObject.discard = turnObject.discard.concat(removal);
        };
        if (discardTrash.next === 'modal') {
          const cardLive = discardTrash.type === removal[0].type,
          accept = () => {
            setMenuScreen(null);
            setDiscardTrashState(false);
          };
          setMenuScreen(
            <ActionModal
              cards={removal}
              accept={accept}
              decline={decline}
              buttonText={actionObject.type}
              live={cardLive}
            />
          );
        } else {
          decline();
        }
        break;
      default: break;
    };
  } else {
    let actionName = 'discards';
    let removal = turnObject.hand.findIndex(i => (i.name === actionObject.restriction));
    if (actionObject.type === 'discard') {
      turnObject.discard = turnObject.discard.concat(turnObject.hand.splice(removal, actionObject.amount));
    } else {
      turnObject.trash = (turnObject.trash.concat(turnObject.hand.splice(removal, actionObject.amount)));
      actionName = 'trashes'
    };
    if (removal === -1) {
      turnObject.treasure = 0;
      turnObject.logs.pop();
    } else {
      turnObject.logs = turnObject.logs.concat(generateLog(turnObject.gameState, [{name: 'Card'}], actionName, actionObject.amount, true))
    }
  };
  
  const checkHand = !hasAction(turnObject.hand);

  return [turnObject, checkHand]
};
