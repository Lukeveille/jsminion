import printLog from './printLog';

export default (gameState, log) => {
  const newLog = log.concat(printLog(gameState, [{name: 'Buy Phase', end: 'enters'}])),
  phase = 'Buy';

  return [newLog, phase, 0];
};
