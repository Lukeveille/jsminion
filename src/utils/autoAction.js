import React from 'react';
import ActionModal from '../components/ActionModal';
import { generateLog } from './printLog';

export default (card, gameState, actionObject, deck, discard, trash, hand, coin, log, setMenuScreen, setDiscardTrashState) => {
  if (actionObject.modifier && actionObject.modifier !== 'up-to') {
    switch (actionObject.modifier) {
      case 'deck':
        let discardTrash = card.deck.split(' ');
        discardTrash = {
          index: discardTrash[0],
          next: discardTrash[1],
          type: discardTrash[2]
        };
        let removal = deck.splice(discardTrash.index, actionObject.amount);
        const decline = () => {
          setMenuScreen(null);
          discard = discard.concat(removal);
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
    let removal = hand.findIndex(i => (i.name === actionObject.restriction));
    if (actionObject.type === 'discard') {
      discard = discard.concat(hand.splice(removal, actionObject.amount));
    } else {
      trash = ([...trash].concat(hand.splice(removal, actionObject.amount)));
      actionName = 'trashes'
    };
    if (removal === -1) {
      coin = 0;
      log.pop();
    } else {
      log = log.concat(generateLog(gameState, [{name: 'Card'}], actionName, actionObject.amount, true))
    }
  };
  return [hand, deck, discard, trash, coin, log]
};
