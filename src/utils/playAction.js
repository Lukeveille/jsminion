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
  actionSupply = false,
  newCards;
  turnObject.logs = turnObject.logs.concat(printLog(turnObject.gameState, [card]));
  turnObject.actions--;
  [turnObject.hand, turnObject.inPlay, newCards] = moveCard(card, size, turnObject.hand, turnObject.inPlay);
  turnObject.treasure += countValue(newCards, 'treasure');
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
  const actionObject = card.discardTrash? parseActionObject(card) : false;
  let checkHandForActions = !hasType(turnObject.hand, 'Action');
  if (actionObject) {
    if (actionObject.next && actionObject.next[0] === 'auto') {
      [turnObject, checkHandForActions] = autoAction(card, turnObject, actionObject, setters);
    } else {
      checkHandForActions = false;
      setters.setDiscardTrashState(actionObject);
    };
  } else if (card.supply) {
    const supplyMsg = card.supply.split(' ');
    actionSupply = {
      treasure: turnObject.treasure,
      count: 1,
      destination: supplyMsg[1]? supplyMsg[1] : 'discard'
    };
    turnObject.treasure = supplyMsg[0];
  };
  let auto = actionObject? (actionObject.next && actionObject.next[0] === 'auto')? true : false : true;
  auto = turnObject.menuScreen? false : auto;
  if ((!turnObject.actions || checkHandForActions) && auto && !actionSupply) {
    [turnObject.logs, turnObject.phase, turnObject.actions] = enterBuyPhase(turnObject.gameState, turnObject.logs);
  };
  setters.setActionSupply(actionSupply);
  return turnObject;
};
