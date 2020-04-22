export default (card, count, source, dest) => {
  const newSource = [...source],
  removal = newSource.findIndex(sourceCard => (sourceCard === card)),
  movingCards = newSource.splice(removal, count),
  newDest = [...dest].concat(movingCards);
  return [newSource, newDest, movingCards];
};
