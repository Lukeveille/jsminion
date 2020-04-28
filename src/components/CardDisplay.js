import React from 'react';
import Card from './Card';
import sorting from '../utils/sorting';

export default props => {
  let stacks = [props.cards],
  count = 1;
  const cardElements = [[], [], []];
  if (props.sort) {
    stacks[0].sort(sorting('name'));
    stacks[0].sort(sorting('type'));
    
    const actions = stacks[0].filter(card => (card.type === 'Action')).sort(sorting('cost')),
    treasures = stacks[0].filter(card => (card.type === 'Treasure')).sort(sorting('cost')),
    victory = stacks[0].filter(card => (card.type === 'Victory')).sort(sorting('cost'));

    stacks = props.supply? [treasures, victory, actions] : [actions, treasures, victory];
  };

  stacks.forEach((cards, i) => {
    cards.forEach((card, j) => {
      let correctAction = (
        (props.phase === card.type && !props.supply) ||
        (props.phase === 'Buy' && card.type === 'Treasure' && !props.supply) ||
        ((props.phase === 'Buy' || props.phase === 'supply') && props.coin - props.coinMod >= card.cost && props.supply) ||
        props.discardTrashState
      );
      
      if (cards[j+1] && cards[j+1].name === card.name) {
        count++;
      } else {
        const cardQueue = props.cardQueue? props.cardQueue : [];

        let limit = Number.MAX_SAFE_INTEGER;

        if (props.discardTrashState && !isNaN(props.discardTrashState.amount)) limit = parseInt(props.discardTrashState.amount);

        if (cardQueue.length > 0) {
          let reduce = 0;
          cardQueue.forEach(spentCard => {
            if (spentCard.name === card.name) reduce += 1;
          });
          count = count - reduce;
          correctAction = count > 0 && cardQueue.length < limit;
        };
        if (props.restriction) {
          correctAction = correctAction && (props.restriction === card.type || props.restriction === card.subType);
        };
        
        if (props.actionSupply) {
          correctAction = correctAction && props.supply;
        };

        cardElements[i].push(
          <div key={`card${i}${j}`} className="inline">
            <Card
              altKey={props.altKey}
              card={card}
              live={props.live? true : correctAction}
              count={count}
              stacked={props.stacked}
              onClick={props.onClick}
              supply={props.supply}
              queued={cardQueue}
              limit={limit}
              destination={props.actionSupply? props.actionSupply.destination : false}
            />
          </div>
        );
        count = 1;
      };
    });
  });

  const allCards = cardElements[0].concat(cardElements[1]).concat(cardElements[2]),
  title = props.title? <p className="red top-spaced">{props.title} ({props.cards.length})</p> : '';

  return props.stacked?
  cardElements.map((stack, i) => {
    return <div key={`stack${i}`} className="stack">{stack}</div>
  })
  : props.supply? 
    cardElements.map((stack, i) => {
      return <div key={`supply${i}`} className="supply">{stack}</div>
    })
  :
  <div>
    {title}
    {allCards}
  </div>
};
