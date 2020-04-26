import printLog from './printLog';

export default (gameState, log) => {
  return [log.concat(printLog(gameState, [{name: 'Buy Phase', end: 'enters'}])), 'Buy', 0];
};
