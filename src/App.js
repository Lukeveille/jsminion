import React from 'react';
import { useState } from 'react';
import shuffle from './utils/shuffle';
import Card from './components/Card';
import startingDeck from './data/startingDeck';
import cards from './data/cards';
import './styles/App.css';

function App() {
  const [cycle, setCycle] = useState('Draw'),
  countValue = (hand, value) => {
    let total = 0;
    hand.forEach(card => {
      total = card[value]? total + card[value] : total;
    });
    return total;
  },
  [deck, setDeck] = useState(shuffle(startingDeck())),
  [hand, setHand] = useState([]),
  [inPlay, setInPlay] = useState([]),
  [discard, setDiscard] = useState([]),
  [victoryPoints, setVictoryPoints] = useState(countValue(deck, 'victory')),
  [treasure, setTreasure] = useState(0),
  [actions, setActions] = useState(0),
  [buys, setBuys] = useState(0),
  [market, setMarket] = useState(cards),
  cardDisplay = (state, isHand) => {
    const cards = [];
    for (let i = 0; i < hand.length; i++) {
      cards.push(
        <Card
          key={`card${i+1}`}
          index={i}
          state={state}
          onClick={isHand && actions > 0? () => {cardInPlay(state[i])} : () => {}}
        />
      )
    }
    return cards;
  },
  hasAction = checkHand => (checkHand.map(card => (card.action? true : false)).includes(true)),
  rollover = (size) => {
    const deckSplit = [...deck];
    let newHand = deckSplit.splice(0,size);
    if (deck.length > size) {
      setDeck(deckSplit);
    } else if (deck.length > 0) {
      const shuffled = shuffle(discard);
      setDiscard([]);
      newHand = newHand.concat(shuffled.splice(0, (size-newHand.length)));
      setDeck(shuffled);
    }
    setTreasure(treasure + countValue(newHand, 'treasure'));
    setCycle(hasAction(newHand)? 'Action' : 'Buy');
    return newHand
  },
  dealCards = () => {
    const newHand = rollover(5)
    if (hasAction(newHand)) setActions(1);
    setHand(hand.concat(newHand));
  },
  cardInPlay = card => {
    if (card.action) {
      let actionTotal = actions - 1,
      newHand = [...hand];
      const removal = newHand.findIndex(i => (i === card));
      newHand.splice(removal, 1);
      if (card.cards) {
        newHand = newHand.concat(rollover(card.cards));
      }
      if (card.actions) {
        actionTotal += card.actions;
      }
      if (card.buys) {}
      if (card.action && card.action.treasure) {}
      if (!actionTotal) setCycle('Buy');
      setActions(hasAction(newHand)? actionTotal : 0);
      setHand(newHand);
      setInPlay([...inPlay, card]);
    }
  },
  endAction = () => {
    setCycle('Buy');
  },
  endBuy = () => {
    discardCards();
    setCycle('Draw');
    setActions(0);
    setBuys(0);
    setTreasure(0);
  },
  discardCards = () => {
    let discarded = discard.concat(inPlay);
    discarded = discarded.concat(hand);
    setDiscard(discarded);
    setHand([]);
    setInPlay([]);
  };

  return (
    <div className="App">
      <h3>{cycle} Phase</h3>
      <div>
        {cycle !== 'Draw'?
        <button onClick={cycle === 'Action'? endAction : endBuy}>
          {`End ${cycle} Phase`}
        </button>
        : ''}
      </div>
      <div>
        <span>VP: {victoryPoints} - </span>
        <span>Actions: {actions} - </span>
        <span>Buys: {buys} - </span>
        <span>Treasure: {treasure} </span>
      </div>
      <div className="hand in-play">{cardDisplay(inPlay)}</div>
      <div className="deck" onClick={() => {}}>{discard.length}</div>
      <div className="hand">{cardDisplay(hand, true)}</div>
      <div className="deck" onClick={() => {
        if (cycle === 'Draw') {
          dealCards(5);
          setBuys(1);
        }
      }}>{deck.length}</div>
    </div>
  );
};

export default App;
