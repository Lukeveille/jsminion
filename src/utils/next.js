import { generateLog } from './printLog';
import rollover from './rollover';
import cleanup from './cleanup';
import parseActionObject from './parseActionObject';

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
        logs: turnObject.logs.concat(generateLog(turnObject.gameState, [{name: 'card'}], 'draws', turnObject.discardTrashQueue.length, true))
      };
      turnObject = cleanup(turnObject);
      break;
    case 'supply':
      const supplyMsg = parseActionObject(turnObject.discardTrashState.card, 'supply');
      newCoin = supplyMsg.type === 'discardTrash'? turnObject.discardTrashQueue[0].cost + parseInt(supplyMsg.amount): supplyMsg.amount;
      setActionSupply({
        treasure: turnObject.treasure,
        count: turnObject.discardTrashState.amount,
        destination: supplyMsg.next && supplyMsg.next[0]? supplyMsg.next[0] : 'discard'
      });
      turnObject.discardTrashQueue = [];
      break;
    default:
  };
  return {...turnObject, treasure: newCoin};
};
