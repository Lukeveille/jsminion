import React from 'react';
import { useState } from 'react';
import shuffle from './utils/shuffle';
import countValue from './utils/countValue';
import hasAction from './utils/hasAction';
import startingDeck from './data/startingDeck';
// import market from './data/market';
import CardDisplay from './components/CardDisplay'
import './styles/App.css';

function App() {
  const [phase, setPhase] = useState('Draw'),
  [deck, setDeck] = useState(shuffle(startingDeck())),
  [hand, setHand] = useState([]),
  [inPlay, setInPlay] = useState([]),
  [discard, setDiscard] = useState([]),
  [treasure, setTreasure] = useState(0),
  [actions, setActions] = useState(0),
  [buys, setBuys] = useState(0),
  [victoryPoints] = useState(countValue(deck, 'victory')),
  // [victoryPoints, setVictoryPoints] = useState(countValue(deck, 'victory')),
  discardCards = () => {
    let discarded = discard.concat(inPlay);
    discarded = discarded.concat(hand);
    setDiscard(discarded);
    setHand([]);
    setInPlay([]);
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
  moveCard = card => {
    let newHand = [...hand],
    treasureCount = countValue(inPlay, 'treasure');
    const removal = newHand.findIndex(i => (i === card));
    newHand.splice(removal, 1);
    if (card.action) {
      if (card.cards) { newHand = newHand.concat(rollover(card.cards)) };
      if (card.buys) { setBuys(buys + card.buys) };
    }
    setHand(newHand);
    setInPlay([...inPlay, card]);
    setTreasure(card.treasure? card.treasure + treasureCount : treasureCount);
    return newHand;
  },
  nextPhase = (card) => {
    let newHand = [];
    switch (phase) {
      case 'Action':
        let actionTotal = actions-1;
        if (card.actions) { actionTotal += card.actions };
        if (card.action) newHand = moveCard(card);
        setActions(hasAction(newHand)? actionTotal : 0);
        if (!actionTotal || !hasAction(newHand)) setPhase('Buy');
        break;
      case 'Buy':
        if (card.treasure) {
          moveCard(card);
        } else {
          setActions(0);
          setBuys(0);
          setTreasure(0);
          discardCards();
          setPhase('Draw');
        };
        break;
      default:
        newHand = rollover(5);
        setHand(newHand);
        if (hasAction(newHand)) setActions(1);
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
      <div className="hand in-play">{<CardDisplay cards={inPlay}/>}</div>
      <div className="deck">{discard.length}</div>
      <div className="hand">{<CardDisplay cards={hand} phase={phase} nextPhase={nextPhase}/>}</div>
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
