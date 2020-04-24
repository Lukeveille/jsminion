import hasAction from './hasAction';
import printLog from './printLog';

export default turnObject => {
  if (!turnObject.actions || !hasAction(turnObject.hand)) {
    turnObject = {...turnObject,
      phase: 'Buy',
      actions: 0,
      logs: turnObject.logs.concat(printLog(turnObject.gameState, [{name: 'Buy Phase', end: 'enters'}]))
    };
  };
  return {...turnObject, discardTrashQueue: [], discardTrashState: false};
};
