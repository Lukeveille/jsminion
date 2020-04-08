export default cards => {
  let treasure = 0;
    cards.forEach(card => {
      treasure += card.treasure? card.treasure : 0;
    });
  return treasure;
};
