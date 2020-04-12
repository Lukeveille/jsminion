import React from 'react';
import Card from './Card';
import sorting from '../utils/sorting';

export default props => {
  let stacks = [props.cards];
  const cardElements = [[], [], []];
  if (props.sort) {
    stacks[0].sort(sorting('name'));
    stacks[0].sort(sorting('type'));
    
    const actions = stacks[0].filter(card => (card.type === 'Action')).sort(sorting('cost')),
    treasures = stacks[0].filter(card => (card.type === 'Treasure')).sort(sorting('cost')),
    victory = stacks[0].filter(card => (card.type === 'Victory')).sort(sorting('cost'));

    stacks = [actions, treasures, victory];
  }
  
  let count = 1;

  stacks.forEach((cards, i) => {
    cards.forEach((card, j) => {
      const correctAction = (
        (props.phase === 'Action' && card.action !== undefined) ||
        (props.phase === 'Buy' && card.treasure !== undefined && card.action === undefined)
      );
      if (cards[j+1] && cards[j+1].name === card.name && props.sort) {
        count++;
      } else {
        cardElements[i].push(
          <div key={`card${i}${j}`} className="inline">
            <Card
              altKey={props.altKey}
              card={card}
              live={correctAction}
              count={count}
              stacked={props.stacked}
              nextPhase={props.nextPhase}
            />
          </div>
        );
        count = 1;
      };
    });
  });
  return props.stacked?
  cardElements.map((stack, i) => {
    return <div key={`stack${i}`} className="stack">{stack}</div>
  })
  :
  cardElements[0].concat(cardElements[1]).concat(cardElements[2]);
};
