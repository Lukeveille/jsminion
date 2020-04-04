import React from 'react';
import { useState } from 'react';
import './App.css';

function App() {
  const startingDeck = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'],
  [cycle, setCycle] = useState('draw'),
  shuffle = arr => {
    let newArr = [...arr]
    let index = newArr.length, temp, random;
    while (0 !== index) {
      random = Math.floor(Math.random() * index);
      index -= 1;
      temp = newArr[index];
      newArr[index] = newArr[random];
      newArr[random] = temp;
    }
    return newArr
  },
  [deck, setDeck] = useState(shuffle(startingDeck)),
  [hand, setHand] = useState([]),
  [inPlay, setInPlay] = useState([]),
  [discard, setDiscard] = useState([]),
  cardDisplay = (state, action) => {
    const cards = [];
    for (let i = 0; i< 5; i++) {
      cards.push(
        <div
          key={`card${i+1}`}
          style={{...cardFrontStyle,
            backgroundColor: state[i]? '#ccc' : '#fff',
            cursor: state[i]? 'pointer' : 'default'
          }}
          onClick={e => { action(state[i]) }}
        >
          {state[i]? state[i] : ''}&nbsp;
        </div>
      )
    }
    return cards;
  },
  dealHand = () => {
    if (cycle === 'draw') {
      const deckSplit = [...deck],
      hand = deckSplit.splice(0,5);
      setDeck(deckSplit);
      setHand(hand);
      setCycle('action');
    }
  },
  cardInPlay = val => {
    if (cycle === 'action') {
      const newHand = [...hand],
      removal = newHand.findIndex(card => (card === val));
      console.log(newHand.splice(removal, removal))
      setHand(newHand);
      setInPlay([...inPlay, val]);
    }
  },
  cardBackStyle = {
    display: 'inline-block',
    height: '6em',
    width: '4em',
    backgroundColor: '#c00',
    cursor: 'pointer'
  },
  cardFrontStyle = {...cardBackStyle,
    margin: '.2em',
    border: '1px solid #000'
  },
  deckStyle = {
    display: 'inline-block',
    margin: '.5em'
  };

  return (
    <div className="App">
      <div style={{...deckStyle, display: 'block'}}>{cardDisplay(inPlay)}</div>
      <div style={cardBackStyle} onClick={dealHand}>{deck.length}</div>
      <div style={deckStyle}>{cardDisplay(hand, cardInPlay)}</div>
      <div style={cardBackStyle} onClick={() => {}}>{discard.length}</div>
    </div>
  );
}

export default App;
