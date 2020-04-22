import countTreasure from './countTreasure';
import countValue from './countValue';
import moveCard from './moveCard';
import rollover from './rollover';
import { generateLog } from './printLog';

export default (card, count, phase, buys, hand, inPlay, deck, discard, trash, setTrash, setDiscardTrashState, gameState, log) => {
  const size = phase === card.type? 1 : count;
  let [newHand, newInPlay, cards] = moveCard(card, size, hand, inPlay),
  newBuys = buys,
  newDiscard = discard,
  newDeck = deck,
  treasureCount = countValue(inPlay, 'treasure'),
  cardLog = log;

  treasureCount += countTreasure(cards);
  if (card.type === 'Action') {
    let rolloverCards = [];
    if (card.cards) { [rolloverCards, newDeck, newDiscard] = rollover(card.cards, newDeck, newDiscard) };
    newHand = newHand.concat(rolloverCards)
    
    if (card.buys) { newBuys += card.buys };
    if (card.discardTrash) {
      let actionInfo = card.discardTrash.split(' '),
      amount = actionInfo[1],
      modifier = '';
      if (amount.includes('|')){
        amount = amount.split('|');
        modifier = amount[1];
        amount = amount[0];
      };
      amount = isNaN(amount)? amount : parseInt(amount);
      const actionObject = {
        card,
        type: actionInfo[0],
        amount,
        modifier,
        next: actionInfo[2]? [actionInfo[2], card[actionInfo[2]]] : [],
        restriction: actionInfo[3]
      };
      if (actionObject.next && actionObject.next[0] === 'auto') {
        if (actionObject.modifier && actionObject.modifier !== 'up-to') {
          switch (actionObject.modifier) {
            case 'deck':
              let discardTrash = card.deck.split(' '),
              newDeck = [...deck];
              discardTrash = {
                index: discardTrash[0],
                next: discardTrash[1],
                type: discardTrash[2]
              };
              let removal = newDeck.splice(discardTrash.index, actionObject.amount);
              const decline = () => {
                // setMenuScreen(null);
                // setDeck(newDeck);
                // setDiscard([...discard].concat(removal));
              };
              console.log(removal)
              if (discardTrash.next === 'modal') {
                // const cardLive = discardTrash.type === removal[0].type,
                // accept = card => {
                  // setMenuScreen(null);
                  // setActions(actions + 1)
                  // playCard(card);
                  // setPhase('Action');
                // };
                // setMenuScreen(actionModal(removal, accept, decline, actionObject.type, cardLive));
              } else {
                decline();
              }
              break;
            default: break;
          }
        } else {
          let actionName = 'discards';
          
          let removal = newHand.findIndex(i => (i.name === actionObject.restriction));

          if (removal === -1) treasureCount = 0;

          if (actionObject.type === 'discard') {
            newDiscard = newDiscard.concat(newHand.splice(removal, actionObject.amount));
          } else {
            setTrash([...trash].concat(newHand.splice(removal, actionObject.amount)));
            actionName = 'trashes'
          };
          cardLog = cardLog.concat(generateLog(gameState, [{name: 'card'}], actionName, actionObject.amount, true))
        }
      } else {
        setDiscardTrashState(actionObject);
      };
    };
  };
  return [newHand, newInPlay, newBuys, newDeck, newDiscard, treasureCount, cardLog];
};
