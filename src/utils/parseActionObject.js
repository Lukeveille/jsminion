export default (card, attribute) => {
  let actionInfo = card[attribute].split(' '),
  amount = actionInfo[1],
  modifier = '',
  index= '';
  if (amount.includes('|')) {
    amount = amount.split('|');
    modifier = amount[1];
    amount = amount[0];
  };
  if (amount.includes('[')) {
    amount = amount.split('[');
    index = amount[1];
    amount = '';
  };
  amount = isNaN(amount)? amount : parseInt(amount);
  modifier = isNaN(modifier)? modifier : parseInt(modifier);
  return {
    card,
    type: actionInfo[0],
    amount,
    index,
    modifier,
    next: actionInfo[2]? [actionInfo[2], card[actionInfo[2]]] : [],
    restriction: actionInfo[3]
  };
};
