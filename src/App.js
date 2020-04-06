import React from 'react';
import { useState } from 'react';
import shuffle from './utils/shuffle';
import countValue from './utils/countValue';
import hasAction from './utils/hasAction';
import Card from './components/Card';
import startingDeck from './data/startingDeck';
// import cards from './data/cards';
import './styles/App.css';

function App() {
  const [phase, setPhase] = useState('Draw'),
  [deck, setDeck] = useState(shuffle(startingDeck())),
  [hand, setHand] = useState([]),
  [inPlay, setInPlay] = useState([]),
  [discard, setDiscard] = useState([]),
  // [victoryPoints, setVictoryPoints] = useState(countValue(deck, 'victory')),
  [victoryPoints] = useState(countValue(deck, 'victory')),
  [treasure, setTreasure] = useState(0),
  [actions, setActions] = useState(0),
  [buys, setBuys] = useState(0),
  // [market, setMarket] = useState(cards),
  cardDisplay = (cards) => {
    const cardElements = [];
    cards.forEach((card, i) => {
      cardElements.push(
        <Card
          key={`card${i+1}`}
          card={card}
          onClick={() => { if (card && card.action && phase === 'Action') nextPhase(card) }}
        />
      )
    })
    return cardElements;
  },
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
    return newHand
  },
  discardCards = () => {
    let discarded = discard.concat(inPlay);
    discarded = discarded.concat(hand);
    setDiscard(discarded);
    setHand([]);
    setInPlay([]);
  },
  nextPhase = (card = {}) => {
    let newHand = [...hand];
    switch (phase) {
      case 'Action':
        let actionTotal = actions-1;
        if (card.action) {
          const removal = newHand.findIndex(i => (i === card)),
          treasureInPlay = inPlay.map(card => (card.action));
          let treasureCount = countValue(treasureInPlay, 'treasure');
          newHand.splice(removal, 1);
          if (card.cards) { newHand = newHand.concat(rollover(card.cards)) };
          if (card.actions) { actionTotal += card.actions };
          if (card.buys) { setBuys(buys + card.buys) };
          if (card.action.treasure) { treasureCount += card.action.treasure};
          setTreasure(treasureCount + countValue(newHand, 'treasure'));
          setHand(newHand);
          setInPlay([...inPlay, card]);
        };
        setActions(hasAction(newHand)? actionTotal : 0);
        if (!actionTotal || !hasAction(newHand)) setPhase('Buy');
        break;
      case 'Buy':
        discardCards();
        setActions(0);
        setBuys(0);
        setTreasure(0);
        setPhase('Draw');
        break;
      default:
        newHand = rollover(5);
        setHand(newHand);
        if (hasAction(newHand)) setActions(1);
        setTreasure(countValue(newHand, 'treasure'));
        setPhase(hasAction(newHand)? 'Action' : 'Buy');
        setBuys(1);
        break;
    }
  };

  return (
    <div className="App">
      <h3>{phase} Phase</h3>
      <div>
        <span>VP: {victoryPoints} - </span>
        <span>Actions: {actions} - </span>
        <span>Buys: {buys} - </span>
        <span>Treasure: {treasure} </span>
      </div>
      <div className="hand in-play">{cardDisplay(inPlay)}</div>
      <div className="deck" onClick={() => {}}>{discard.length}</div>
      <div className="hand">{cardDisplay(hand, true)}</div>
      <div className="deck">{deck.length}</div>
      <div>
        <button onClick={nextPhase}>
          {phase === 'Draw'? phase : `End ${phase} Phase`}
        </button>
      </div>
    </div>
  );
};

export default App;
