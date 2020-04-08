import React from 'react';
import { useState } from 'react';
import shuffle from './utils/shuffle';
import countValue from './utils/countValue';
import hasAction from './utils/hasAction';
import startingCards from './data/startingCards';
import CardDisplay from './components/CardDisplay'
import './styles/App.css';

function App() {
  const startingDeck = shuffle(startingCards()),
  startingHand = startingDeck.splice(0, 5),
  [phase, setPhase] = useState(),
  [turn] = useState(true),
  [deck, setDeck] = useState(startingDeck),
  [hand, setHand] = useState(startingHand),
  [inPlay, setInPlay] = useState([]),
  [discard, setDiscard] = useState([]),
  [treasure, setTreasure] = useState(0),
  [actions, setActions] = useState(0),
  [buys, setBuys] = useState(0),
  allCards = () => {
    let allCards = deck.concat(hand);
    allCards = allCards.concat(inPlay);
    allCards = allCards.concat(discard);
    return allCards;
  },
  // [victoryPoints] = useState(countValue(allCards(), 'victory')),
  rollover = size => {
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
  nextPhase = card => {
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
          const deckSplit = [...deck];
          setInPlay([]);
          let discarded = discard.concat(inPlay);
          discarded = discarded.concat(hand);
          newHand = deckSplit.splice(0,5);
          if (deck.length > 5) {
            setDeck(deckSplit);
          } else if (deck.length > 0) {
            const shuffled = shuffle(discarded);
            discarded = [];
            newHand = newHand.concat(shuffled.splice(0, (5-newHand.length)));
            setDeck(shuffled);
          }
          setHand(newHand);
          setDiscard(discarded);
          setActions(0);
          setBuys(0);
          setTreasure(0);
          setPhase(null);
        };
        break;
      default:
        setBuys(1);
        if (hasAction(hand)) setActions(1);
        setPhase(hasAction(hand)? 'Action' : 'Buy');
        break;
    }
  };

  return (
    <div className="App">
      <h2>{phase? `${phase} Phase` : 'Turn Over'} </h2>
      <div>
        {/* <span>VP: {victoryPoints} | </span> */}
        <span>Action <span className='red'>{actions}</span> | </span>
        <span>Buys <span className='red'>{buys}</span> | </span>
        <span>Coin <span className='red'>{treasure}</span> </span>
      </div>
      <div className="hand in-play">{<CardDisplay cards={inPlay}/>}</div>
      
      <div>
        <div className="deck">
          <p>Discard</p>
          <p>{discard.length}</p>
        </div>
        <div className="deck">
          <p>{deck.length}</p>
          <p>Deck</p>
        </div>
      </div>

      <div className="card-display">{<CardDisplay cards={hand} phase={phase} nextPhase={nextPhase}/>}</div>
      <div>
        <button disabled={!turn} onClick={nextPhase}>
          {phase? `End ${phase} Phase` : 'Start Turn'}
        </button>
      </div>
    </div>
  );
};

export default App;
