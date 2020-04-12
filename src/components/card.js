import React from 'react';
import { useState, useEffect } from 'react';


export default props => {
  const [showFullCard, setShowFullCard] = useState(false);
  const [altKey, setAltKey] = useState(false);

    useEffect(e => {
      setAltKey(props.altKey)
    }, [props.altKey])

  return <div className="card-info">
    {props.count > 1? <p
      onClick={e => {
        if (props.live) {
          props.onClick(props.card, props.count);
          e.stopPropagation();
        }
      }}
      className={`card-stack${props.live && props.card.type !== 'Action' && props.stacked? '-live' : ''}`}
    >
      {props.count}
    </p> : ''}
    <div
      className={`card ${props.card.type} ${props.card.name === 'Curse'? 'curse' : ''} ${props.live? 'live' : ''}`}
      onClick={() => { if (props.live) props.onClick(props.card, 1, props.supply? true : false) }}
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
        <div className={`full-card ${props.card.type} ${showFullCard && altKey? '' : 'hidden'} ${props.live? 'full-card-live' : ''} ${props.card.name === 'Curse'? 'curse' : ''}`}>
          <div className="card-top">
            <p>{props.card.name}</p>
            <div
              className={`${props.card.type === 'Action'? 'action' : 'card'}-image`}
              style={{
                backgroundImage: `url(${props.card.path})`
              }}
            />
            {props.card.type === 'Action'? <div className="card-instructions">
              <div className="perks">
              {props.card.cards? <p>+{props.card.cards} Card{props.card.cards > 1? 's' : ''}</p> : ''}
              {props.card.actions? <p>+{props.card.actions} Action{props.card.actions > 1? 's' : ''}</p> : ''}
              {props.card.buys? <p>+{props.card.buys} Buy{props.card.buys > 1? 's' : ''}</p> : ''}
              {props.card.treasure? <p>+<span className='coin'>{props.card.treasure}</span></p> : ''}
              </div>
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
