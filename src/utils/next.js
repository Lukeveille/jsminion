import { generateLog } from './printLog';
import rollover from './rollover';
import cleanup from './cleanup';

export default (gameState, discardTrashState, discardTrashQueue, deck, discard, hand, phase, treasure, log, actions, setActionSupply) => {
  const nextAction = discardTrashState.next[0];
  let newCoin = treasure;
  switch (nextAction) {
    case 'draw':
      let rolloverCards;
      const newSize = !isNaN(discardTrashState.next[1])? discardTrashState.next[1] : discardTrashQueue.length;
      [rolloverCards, deck, discard] = rollover(newSize, deck, discard);
      hand = hand.concat(rolloverCards);
      log = log.concat(generateLog(gameState, [{name: 'Card'}], 'draws', discardTrashQueue.length, true));
      [log, actions, phase, discardTrashQueue, discardTrashState] = cleanup(hand, actions, phase, gameState, log);
      break;
    case 'supply':
      const supplyMsg = discardTrashState.card.supply.split(' ');
      newCoin = supplyMsg[0] === 'discardTrash'? discardTrashQueue[0].cost + parseInt(supplyMsg[1]): supplyMsg[0];
      setActionSupply({treasure, count: discardTrashState.amount, restriction: supplyMsg[2]});
      discardTrashQueue = [];
      break;
    default:
  };
  return [hand, log, newCoin, phase, actions, discardTrashQueue, discardTrashState];
};
