export default checkHand => (
  checkHand.map(card => (card.type === 'Action'? true : false)).includes(true)
);