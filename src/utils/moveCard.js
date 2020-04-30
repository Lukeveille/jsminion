export default (card, count, source, dest) => {
  const newSource = [...source];
  const removal = newSource.findIndex(sourceCard => (sourceCard === card));
  const movingCards = newSource.splice(removal, count);
  const newDest = [...dest].concat(movingCards);
  return [newSource, newDest, movingCards];
};
