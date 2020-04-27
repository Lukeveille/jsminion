import React from 'react';
import ActionModal from '../components/ActionModal';
import { generateLog } from './printLog';
import hasType from './hasType';
import cleanup from './cleanup';

export default (card, turnObject, actionObject, setters) => {
  if (actionObject.modifier && actionObject.modifier !== 'up-to') {
    let discardTrash = card[actionObject.modifier].split(' ');
    discardTrash = {
      index: discardTrash[0],
      next: discardTrash[1],
      type: discardTrash[2]
    };
    switch (actionObject.modifier) {
      case 'deck':
        if (turnObject.deck.length < 1) turnObject = {...turnObject, deck: turnObject.discard, discard: []};
        let removal = turnObject.deck.splice(discardTrash.index, actionObject.amount);
        const discard = () => {
          turnObject.discard = turnObject.discard.concat(removal);
          turnObject.logs = turnObject.logs.concat(generateLog(turnObject.gameState, [{name: 'Card'}], 'discards', 1, true))
        };
        if (discardTrash.next === 'modal') {
          const cardLive = discardTrash.type === removal[0].type,
          decline = () => {
            turnObject.actions--;
            setters.setMenuScreen(null);
            turnObject = cleanup(turnObject);
            if (turnObject.actions === 0) setters.setPhase('Buy');
            setters.setActions(turnObject.actions);
            
            console.log(turnObject)

            setters.setDiscard(turnObject.discard.concat(removal));
            // const temp = turnObject.logs.pop();
            // setters.setLogs(turnObject.logs.concat(generateLog(turnObject.gameState, [{name: 'Card'}], 'discards', 1, true)).concat(temp));
            setters.setDiscardTrashState(false);
          },
          accept = () => {
            setters.setMenuScreen(null);
            setters.setDiscardTrashState(false);
            setters.nextPhase(removal[0], 1);
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
              />
            );
          } else {
            discard();
          };
        } else {
          discard();
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
      // turnObject.treasure = 0;
      console.log(turnObject.inPlay.filter(playCard => (playCard === card)));
      turnObject.coinMod += 3;
      turnObject.logs.pop();
    } else {
      turnObject.logs = turnObject.logs.concat(generateLog(turnObject.gameState, [{name: 'Card'}], actionName, actionObject.amount, true))
    };
  };
  
  const checkHand = !hasType(turnObject.hand, 'Action');

  return [turnObject, checkHand]
};
