import React from 'react';
import { useState } from 'react';

export default props => {
  const [showFullCard, setShowFullCard] = useState(false);

  return <div className="card-info">
    {props.count > 1? <p onClick={e => {
      if (props.live) {
        props.nextPhase(props.card, props.count);
        e.stopPropagation();
      }
    }}className={`card-stack${props.live && props.card.type !== 'Action'? '-live' : ''}`}>{props.count}</p> : ''}
    <div
      className={`card ${props.card.type} ${props.live? 'live' : ''}`}
      onClick={() => {if (props.live) { props.nextPhase(props.card, 1) }}}
      onMouseOver={() => {
        setShowFullCard(true);
      }}
      onMouseOut={() => {
        setShowFullCard(false);
      }}
    >
      <p className="card-top">{props.card.name}</p>
      <div className="card-btm">
        <p className="card-side">{props.card.cost}</p>
        <p>{props.card.type}</p>
        <p className="card-side">&nbsp;</p>
      </div>
      <div className={`full-card-wrapper  ${props.stacked? 'lower-card' : ''}`}>
        <div className={`full-card ${props.card.type} ${showFullCard && props.altKey? '' : 'hidden'} ${props.live? 'full-card-live' : ''}`}>
          <div className="card-top">
            <p>{props.card.name}</p>
            <div
              className={`${props.card.type === 'Action'? 'action' : 'card'}-image`}
              style={{
                backgroundImage: `url(${props.card.path})`
              }}
            />
            {props.card.type === 'Action'? <div className="card-innstructions">
              <div className="perks"></div>
              <div className="instructions">{props.card.instructions}</div>
            </div> : ''}
          </div>
          <div className="card-btm">
            <p className="card-side">{props.card.cost}</p>
            <p>{props.card.type}</p>
            <p className="card-side">&nbsp;</p>
          </div>
        </div>
      </div>
    </div>
  </div>
};
