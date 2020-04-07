import React from 'react';

export default props => {
  return <div
    className={`card ${props.live? ' live' : ''}`}
    style={{
      margin: '1rem',
      backgroundColor: props.card?
        props.card.action?
        '#aaafb2' :
        props.card.victory?
        '#76a08c' : '#f2cda2' : '#fff',
      cursor: props.live? 'pointer' : 'default'
    }}
    onClick={props.onClick}
  >
    <p className="card-top">{props.card.name}</p>
    <div className="card-btm">
      <p className="card-side">{props.card.cost}</p>
      <p>{props.card.action? 'Action' : props.card.victory? 'Victory' : 'Treasure'}</p>
      <p className="card-side">&nbsp;</p>
    </div>
  </div>
};
