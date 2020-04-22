import shuffle from './shuffle';

export default (size, deck, discard) => {
  let newDeck = [...deck],
  newHand = newDeck.splice(0,size),
  newDiscard = [...discard];

  if (deck.length < size) {
    newDeck = newDeck.concat(shuffle(newDiscard));
    newDiscard = [];
    newHand = newHand.concat(newDeck.splice(0, (size - newHand.length)));
  };
  return [newHand, newDeck, newDiscard];
};
