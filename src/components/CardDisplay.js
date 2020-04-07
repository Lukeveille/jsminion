import React from 'react';
import Card from './Card';

export default props => {
  const cardElements = [];
  props.cards.forEach((card, i) => {
    let correctAction = (props.phase === 'Action' && card.action !== undefined) || (props.phase === 'Buy' && card.treasure !== undefined && card.action === undefined)
    
    cardElements.push(
      <div style={{position: 'relative'}} key={`card${i+1}`}>
        {card.cost > 1? <p className="card-stack">{card.cost}</p> : ''}
        <Card
          card={card}
          live={correctAction}
          onClick={() => { if (correctAction) props.nextPhase(card) }}
        />
      </div>
    );
  });
  return cardElements;
};
