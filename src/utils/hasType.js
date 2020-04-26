export default (hand, type) => (
  hand.map(card => (card.type === type? true : false)).includes(true)
);