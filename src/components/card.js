import React from 'react';

export default props => {
  return <div
    className="card-front"
    style={{
      backgroundColor: props.card?
        props.card.treasure?
        '#dd0' :
        props.card.victory?
        '#0a0' : '#ccc' : '#fff',
      cursor: props.card? 'pointer' : 'default'
    }}
    onClick={props.onClick}
  >
    {props.card? props.card.name : ''}&nbsp;
  </div>
};
