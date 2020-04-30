import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import capital from './capital';

export const spacer = () => ([<div key={`log${uuidv4().slice(0,8)}`} className="spacer"/>]);

const colors = ['red', 'blue', 'orange', 'green'],
logActions = ['actions', 'buys', 'treasure', 'cards'];

export const generateLog = (gameState, cards, cardAction, num, actionLog) => {
  const size = num || num === 0? num : cards? cards.length : 1;
  let action = cards && cards[0].end? cards[0].end : cardAction? cardAction : 'plays';

  return [
    <div
      className="log"
      key={`log${uuidv4().slice(0,8)}`}
    >
      <p className={`${cards? '' : 'turn-log'}`}>
        {cards? actionLog? '•' : '' : <span>Turn {gameState.turn} -&nbsp;</span>}
        <span className={`${colors[gameState.turnPlayer-1]}`}>P{gameState.player}</span>
        {cards?
        <span>
          &nbsp;{action} {cards && (cards[0].name === 'Action' || cards[0].name === 'Buy' || cards[0].name === 'Coin')? '+' : ''}
          <span className={cards[0].name === 'Coin'? 'coin' : ''}>{cards && cards[0].end? 'their' : size === 1 && !actionLog? 'a' : size}</span>
          <span className={`${cards[0].type}-text`}>
            &nbsp;{cards[0].name === 'Coin'? '' : <span>{cards[0].name}</span>}
            {size !== 1 && cards[0].type !== 'Treasure' && cards[0].name !== 'Coin'? 's' : ''}
          </span>
        </span>
        :
        ''}
      </p>
    </div>
  ];
};

export default (gameState, cards, cardAction, num) => {
  let newLogs = [];
  newLogs = newLogs.concat(generateLog(gameState, cards, cardAction, num));
  
  if (cards && cards[0].type === 'Action' && cardAction !== 'buys') {
    logActions.forEach(action => {
      const descriptor = action === 'cards'? 'draws' : 'gets',
      name =  action === 'treasure'? 'Coin': capital(action).slice(0, -1),
      invalid = action === 'cards' && cards && isNaN(cards[0].cards);
      if (cards[0][action] && !invalid) newLogs = newLogs.concat(generateLog(gameState, [{...cards[0], name}], descriptor, cards[0][action], true));
    })
  };
  return newLogs;
};