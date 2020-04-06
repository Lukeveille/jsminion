export default (hand, value) => {
  let total = 0;
  hand.forEach(card => {
    total = card[value]? total + card[value] : total;
  });
  return total;
};