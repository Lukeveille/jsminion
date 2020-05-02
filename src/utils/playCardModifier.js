import capital from './capital';
import { generateLog } from './printLog';

export default (card, turnObject) => {
  if ((!turnObject.playMod.restriction ||  turnObject.playMod.restriction === card.name || turnObject.playMod.restriction === card.type) &&
  (isNaN(turnObject.playMod.modifier) || turnObject.playMod.modifier > 0)) {
    turnObject[turnObject.playMod.type] += turnObject.playMod.amount;
    turnObject.playMod = {...turnObject.playMod, modifier: turnObject.playMod.modifier - 1};
    turnObject.logs = turnObject.logs.concat(generateLog(turnObject.gameState, [{name: capital(turnObject.playMod.type.split('Mod')[0])}], 'gets', turnObject.playMod.amount, true));
  };
  return turnObject;
};
