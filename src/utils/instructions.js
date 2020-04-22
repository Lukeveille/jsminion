export default (phase, buys, action, alt) => {
  let message = '';
  if (action) {
    const modifier = action.modifier? `${action.modifier.split('-').join(' ')} ` : '',
    plural = action.amount && isNaN(action.amount)? '(s)' : action.amount > 1? 's' : '';
    message = `Select ${modifier}${action.amount} card${plural}${alt? '' : ` to ${action.type}`}`;
  } else if (alt) {
    message = `Choose a Card`;
  } else if (phase === 'Buy') {
    message = `Choose Cards to Buy (${buys})`;
  } else {
    message = 'Choose Actions to play';
  };
  return message;
};
