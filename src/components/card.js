import React from 'react';

export default props => {
  return <div
    className="card-front"
    style={{
      backgroundColor: props.card?
        props.card.action?
        '#ccc' :
        props.card.victory?
        '#0a0' : '#dd0' : '#fff',
      cursor: props.card? 'pointer' : 'default'
    }}
    onClick={props.onClick}
  >
    {props.card? props.card.name : ''}&nbsp;
  </div>
};
