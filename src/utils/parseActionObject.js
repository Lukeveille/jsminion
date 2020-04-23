export default card => {
  let actionInfo = card.discardTrash.split(' '),
  amount = actionInfo[1],
  modifier = '';
  if (amount.includes('|')){
    amount = amount.split('|');
    modifier = amount[1];
    amount = amount[0];
  };
  amount = isNaN(amount)? amount : parseInt(amount);
  const actionObject = {
    card,
    type: actionInfo[0],
    amount,
    modifier,
    next: actionInfo[2]? [actionInfo[2], card[actionInfo[2]]] : [],
    restriction: actionInfo[3]
  };
  return actionObject
};
