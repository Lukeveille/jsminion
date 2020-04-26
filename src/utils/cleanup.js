import hasType from './hasType';
import enterBuyPhase from './enterBuyPhase';

export default turnObject => {
  if (!turnObject.actions || !hasType(turnObject.hand, 'Action')) {
    [turnObject.logs, turnObject.phase, turnObject.actions] = enterBuyPhase(turnObject.gameState, turnObject.logs);
  };
  return {...turnObject, discardTrashQueue: [], discardTrashState: false};
};
