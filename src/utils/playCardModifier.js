import { generateLog } from './printLog';

export default (cards, turnObject) => {
  cards.forEach(card => {
    const restrict = turnObject.playMod.restriction,
    mod = turnObject.playMod.modifier;
    if (turnObject.playMod && (!restrict || restrict === card.name || restrict === card.type) && (isNaN(mod) || mod > 0)) {
      const newCount = isNaN(mod)? mod : mod - 1;
      turnObject.coinMod += turnObject.playMod.amount;
      turnObject.logs = turnObject.logs.concat(generateLog(turnObject.gameState, [{name: 'Coin'}], 'gets', turnObject.playMod.amount, true));
      turnObject.playMod = newCount === 0? false : {...turnObject.playMod, modifier: newCount};
    };
  })
  return turnObject;
};
