export default hand => {
  const handTreasures = hand.filter(card => (card.type === 'Treasure'));
  return handTreasures.length;
};
