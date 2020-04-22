import hasAction from './hasAction';
import printLog from './printLog';

export default (newHand, actions, phase, gameState, logs) => {
  let newLog = [...logs],
  newDiscardTrashQueue = [],
  discardTrashState = false;
  if (!actions || !hasAction(newHand)) {
    phase = 'Buy';
    actions = 0;
    newLog = newLog.concat(printLog(gameState, [{name: 'Buy Phase', end: 'enters'}]));
  };
  return [newLog, actions, phase, newDiscardTrashQueue, discardTrashState];
};
