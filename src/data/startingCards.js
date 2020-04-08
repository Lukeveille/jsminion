import cards from './cards';

export default () => {
  const startingDeck = [];
  for (let j = 0; j < 3; j++) {
    for (let i = 0; i < 7; i++) {
      startingDeck.push(cards.treasure[j]);
    };
  }
  for (let i = 0; i < 3; i++) {
    startingDeck.push(cards.victory[0]);
  };
  for (let j = 0; j < 3; j++) {
    for (let i = 0; i < 3; i++) {
      startingDeck.push(cards.kingdom[j]);
    };
  }
  return startingDeck;
};
