import { generateLog } from './printLog';
import rollover from './rollover';
import cleanup from './cleanup';

export default (turnObject, setActionSupply) => {
  const nextAction = turnObject.discardTrashState.next[0];
  let newCoin = turnObject.treasure;
  switch (nextAction) {
    case 'draw':
      let rolloverCards;
      const newSize = !isNaN(turnObject.discardTrashState.next[1])? turnObject.discardTrashState.next[1] : turnObject.discardTrashQueue.length;
      [rolloverCards, turnObject.deck, turnObject.discard] = rollover(newSize, turnObject.deck, turnObject.discard);
      turnObject = {...turnObject,
        hand: turnObject.hand.concat(rolloverCards),
        logs: turnObject.logs.concat(generateLog(turnObject.gameState, [{name: 'Card'}], 'draws', turnObject.discardTrashQueue.length, true))
      };
      turnObject = cleanup(turnObject);
      break;
    case 'supply':
      const supplyMsg = turnObject.discardTrashState.card.supply.split(' ');
      newCoin = supplyMsg[0] === 'discardTrash'? turnObject.discardTrashQueue[0].cost + parseInt(supplyMsg[1]): supplyMsg[0];
      setActionSupply({treasure: turnObject.treasure, count: turnObject.discardTrashState.amount, restriction: supplyMsg[2]});
      turnObject.discardTrashQueue = [];
      break;
    default:
  };
  return {...turnObject, treasure: newCoin};
};
