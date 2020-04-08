import React from 'react';
import Card from './Card';

export default props => {
  const sorting = type => {
    return (a, b) => {
      let compare = 0;
      if (a[type] > b[type]) {
        compare = 1;
      } else if (a[type] < b[type]) {
        compare = -1;
      }
      return compare;
    }
  }
  const cards = props.cards,
  cardElements = [];
  cards.sort(sorting('type'));
  cards.sort(sorting('name'));
  let count = 1;
  for (let i = 0; i < cards.length; i++) {
    const correctAction = (
      (props.phase === 'Action' && cards[i].action !== undefined) ||
      (props.phase === 'Buy' && cards[i].treasure !== undefined && cards[i].action === undefined)
    )
    if (cards[i+1] && cards[i+1].name === cards[i].name) {
      count++;
    } else {
      cardElements.push(
        <div className="card-info" key={`card${i+1}`}>
          {count > 1? <p className="card-stack">{count}</p> : ''}
          <Card
            card={cards[i]}
            live={correctAction}
            count={count}
            onClick={() => { if (correctAction) props.nextPhase(cards[i]) }}
          />
        </div>
      );
      count = 1;
    };
  };
  return cardElements;
};
