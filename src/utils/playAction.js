import parseActionObject from './parseActionObject';
import autoAction from './autoAction';
import printLog from './printLog';
import moveCard from './moveCard';
import countValue from './countValue';
import rollover from './rollover';
import hasType from './hasType';
import enterBuyPhase from './enterBuyPhase';

export default (card, size, turnObject, setters) => {
  let rolloverCards = [],
  newCards;
  turnObject.logs = turnObject.logs.concat(printLog(turnObject.gameState, [card]));
  turnObject.actions--;
  [turnObject.hand, turnObject.inPlay, newCards] = moveCard(card, size, turnObject.hand, turnObject.inPlay);
  turnObject.treasure += countValue(newCards, 'treasure');
  if (card.actions) turnObject.actions += card.actions;
  if (card.buys) turnObject.buys += card.buys;
  if (card.cards) {
    [rolloverCards, turnObject.deck, turnObject.discard] = rollover(card.cards, turnObject.deck, turnObject.discard);
    turnObject.hand = turnObject.hand.concat(rolloverCards);
  };
  const actionObject = card.discardTrash? parseActionObject(card) : false;
  let checkHandForActions = !hasType(turnObject.hand, 'Action');
  if (actionObject) {
    if (actionObject.next && actionObject.next[0] === 'auto') {
      [turnObject, checkHandForActions] = autoAction(card, turnObject, actionObject, setters);
    } else {
      checkHandForActions = false;
      setters.setDiscardTrashState(actionObject);
    };
  };
  let auto = actionObject? actionObject.next && actionObject.next[0] === 'auto'? true : false : true;
  auto = turnObject.menuScreen? false : auto;
  if ((!turnObject.actions || checkHandForActions) && auto) {
    [turnObject.logs, turnObject.phase, turnObject.actions] = enterBuyPhase(turnObject.gameState, turnObject.logs);
  };

  return turnObject;
};