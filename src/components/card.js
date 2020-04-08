import React from 'react';

export default props => {
  return <div
    className={`card ${props.card.type} ${props.live? 'live' : ''}`}
    onClick={() => {if (props.live) { props.nextPhase(props.card, props.count) }}}
  >
    <p className="card-top">{props.card.name}</p>
    <div className="card-btm">
      <p className="card-side">{props.card.cost}</p>
      <p>{props.card.type}</p>
      <p className="card-side">&nbsp;</p>
    </div>
  </div>
};
