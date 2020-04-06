import cards from './cards';

export default () => {
  const startingDeck = [];
  for (let i = 0; i < 7; i++) {
    startingDeck.push(cards.treasure[0]);
  };
  for (let i = 0; i < 3; i++) {
    startingDeck.push(cards.victory[0]);
  };
  for (let i = 0; i < 3; i++) {
    startingDeck.push(cards.kingdom[i]);
  };
  return startingDeck;
};
