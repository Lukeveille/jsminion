export default (hand, attribute, value) => {
  const handTreasures = hand.filter(card => (card[attribute] === value));
  return handTreasures.length;
};
