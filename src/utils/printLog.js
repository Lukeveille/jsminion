import React from 'react';
import { v4 as uuidv4 } from 'uuid';

export const dotdotdot = [<p key={`log${uuidv4().slice(0,8)}`}>...</p>],
spacer = <div key={`log${uuidv4().slice(0,8)}`} className="spacer"/>;

const colors = ['red', 'blue', 'orange', 'green'],
logActions = ['actions', 'cards', 'buys', 'treasure'],
capital = str => (str.charAt(0).toUpperCase() + str.slice(1)),
generateLog = (gameState, cards, cardAction, num, actionLog) => {
  const size = num? num : cards? cards.length : 1;
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
          {cards && cards[0].end? 'their' : size === 1 && !actionLog? 'a' : size}
          <span className={`${cards[0].type}-text`}>
            &nbsp;{cards[0].name}
            {size > 1 && cards[0].type !== 'Treasure'? 's' : ''}
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
  if (cards && cards[0] && cards[0].type === 'Action' && cardAction !== 'buys') {
    logActions.forEach(action => {
      const descriptor = action === 'cards'? 'draws' : 'gets',
      name =  action === 'treasure'? 'Coin': capital(action).slice(0, -1);
      if (cards[0][action]) newLogs = newLogs.concat(generateLog(gameState, [{...cards[0], name}], descriptor, cards[0][action], true));
    })
  };
  return newLogs;
};