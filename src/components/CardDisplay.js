import React from 'react';
import Card from './Card';
import sorting from '../utils/sorting';

export default props => {
  const cards = props.cards,
  cardElements = [[], [], []];
  cards.sort(sorting('name'));
  cards.sort(sorting('type'));
  let count = 1;

  const actions = cards.filter(card => (card.type === 'Action')).sort(sorting('cost')),
  treasures = cards.filter(card => (card.type === 'Treasure')).sort(sorting('cost')),
  victory = cards.filter(card => (card.type === 'Victory')).sort(sorting('cost')),
  stacks = [actions, treasures, victory];

  stacks.forEach((cards, i) => {
    cards.forEach((card, j) => {
      const correctAction = (
        (props.phase === 'Action' && card.action !== undefined) ||
        (props.phase === 'Buy' && card.treasure !== undefined && card.action === undefined)
      )
      if (cards[j+1] && cards[j+1].name === card.name) {
        count++;
      } else {
        cardElements[i].push(
          <div key={`card${i}${j}`} className="inline">
            <Card
              card={card}
              live={correctAction}
              count={count}
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
