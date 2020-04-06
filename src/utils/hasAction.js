export default checkHand => (
  checkHand.map(card => (card.action? true : false)).includes(true)
);