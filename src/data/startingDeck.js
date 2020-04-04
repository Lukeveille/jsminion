import gold from './gold';
import action from './action';

export default () => {
  const deck = [];
  for (let i = 0; i < 8; i++) {
    deck.push(gold[0]);
  };
  action.forEach(card => {
    deck.push(card);
  });
  return deck;
};
