import React from 'react';
import { useState } from 'react';
import shuffle from './utils/shuffle';
import Card from './components/Card';
import startingDeck from './data/startingDeck.js';
import './styles/App.css';

function App() {
  const [cycle, setCycle] = useState('draw'),
  [deck, setDeck] = useState(shuffle(startingDeck())),
  [hand, setHand] = useState([]),
  [inPlay, setInPlay] = useState([]),
  [discard, setDiscard] = useState([]),
  cardDisplay = (state, oldState, newState, end) => {
    const cards = [];
    for (let i = 0; i< 5; i++) {
      cards.push(
        <Card
          key={`card${i+1}`}
          index={i}
          state={state}
          onClick={() => {cardInPlay(state[i], state, oldState, newState, end)}}
        />
      )
    }
    return cards;
  },
  cardInPlay = (value, start, oldState, newState, end) => {
    if (value && cycle === value.cycle) {
      const newHand = [...start],
      removal = newHand.findIndex(card => (card === value));
      newHand.splice(removal, 1)
      oldState(newHand);
      newState([...end, value]);
    }
  },
  dealHand = () => {
    if (cycle === 'draw') {
      const deckSplit = [...deck];
      let newHand = deckSplit.splice(0,5);
      if (deck.length > 5) {
        setDeck(deckSplit);
      } else if (deck.length > 0) {
        const shuffled = shuffle(discard)
        setDiscard([]);
        newHand = newHand.concat(shuffled.splice(0, (5-newHand.length)))
        setDeck(shuffled)
      }
      const noAction = newHand.map(card => (card.cycle !== 'action')).includes(true);
      noAction? setCycle('action') : setCycle('buy');
      setHand(newHand);
    }
  },
  actionBuy = () => {
    if (cycle === 'action') {
      discardCards();
      setCycle('buy');
    } else if (cycle === 'buy') {
      discardCards(true);
      setCycle('draw');
    };
  },
  discardCards = all => {
    let discarded = discard.concat(inPlay);
    if (all) {
      discarded = discarded.concat(hand);
      setHand([]);
    }
    setDiscard(discarded);
    setInPlay([]);
  };

  return (
    <div className="App">
      <h3>{cycle} phase</h3>
      <div>
        <button
          disabled={cycle === 'draw'}
          onClick={actionBuy}
        >
          {cycle === 'buy'? 'Buy' : `Play Action`}
        </button>
      </div>
      <div className="hand in-play">{cardDisplay(inPlay, setInPlay, setHand, hand)}</div>
      <div className="deck" onClick={dealHand}>{deck.length}</div>
      <div className="hand">{cardDisplay(hand, setHand, setInPlay, inPlay)}</div>
      <div className="deck" onClick={() => {}}>{discard.length}</div>
    </div>
  );
};

export default App;
