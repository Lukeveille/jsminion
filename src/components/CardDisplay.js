import React from 'react';
import Card from './Card';

export default props => {
  const cardElements = [];
  props.cards.forEach((card, i) => {
    let correctAction = (props.phase === 'Action' && card.action !== undefined) || (props.phase === 'Buy' && card.treasure !== undefined && card.action === undefined)
    cardElements.push(
      <Card
        key={`card${i+1}`}
        card={card}
        onClick={() => { if (card && correctAction) props.nextPhase(card) }}
      />
    );
  });
  return cardElements;
};
