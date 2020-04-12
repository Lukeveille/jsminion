import React from 'react';
import { useState } from 'react';
import shuffle from './utils/shuffle';
import countValue from './utils/countValue';
import hasAction from './utils/hasAction';
import startingCards from './data/startingCards';
import countTreasure from './utils/countTreasure';
import CardDisplay from './components/CardDisplay';
import Modal from './components/Modal';
import './styles/App.css';

function App() {
  const startingDeck = shuffle(startingCards()),
  startingHand = startingDeck.splice(0, 5),
  [phase, setPhase] = useState(),
  [showModal, setShowModal] = useState(false),
  [modalContent, setModalContent] = useState([]),
  [altKey, setAltKey] = useState(false),
  [turn] = useState(true),
  [deck, setDeck] = useState(startingDeck),
  [hand, setHand] = useState(startingHand),
  [inPlay, setInPlay] = useState([]),
  [discard, setDiscard] = useState([]),
  [trash, setTrash] = useState([]),
  [treasure, setTreasure] = useState(0),
  [actions, setActions] = useState(0),
  [buys, setBuys] = useState(0),
  currentModal = cards => {
    return <Modal
      show={showModal}
      setShow={setShowModal}
      children={<CardDisplay altKey={altKey} cards={cards} />}
    />
  },
  allCards = () => {
    let allCards = deck.concat(hand);
    allCards = allCards.concat(inPlay);
    allCards = allCards.concat(discard);
    return allCards;
  },
  treasureInHand = () => {
    const handTreasures = hand.filter(card => (card.type === 'Treasure'));
    return handTreasures.length;
  },
  [victoryPoints] = useState(countValue(allCards(), 'victory')),
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
    return newHand;
  },
  playTreasure = () => {
    let newHand = [...hand];
    const treasures = newHand.filter(card => (card.type === 'Treasure')),
    newPlay = [...inPlay].concat(treasures);
    newHand = newHand.filter(card => (card.type !== 'Treasure'));
    setTreasure(countTreasure(newPlay));
    setInPlay(newPlay);
    setHand(newHand);
  },
  playCard = (card, count) => {
    let newHand = [...hand],
    treasureCount = countValue(inPlay, 'treasure');
    const removal = newHand.findIndex(i => (i === card)),
    size = phase === 'Action' && card.type === 'Action'? 1 : count,
    cards = newHand.splice(removal, size);
    treasureCount += countTreasure(cards);
    if (card.action) {
      if (card.cards) { newHand = newHand.concat(rollover(card.cards)) };
      if (card.buys) { setBuys(buys + card.buys) };
    }
    setHand(newHand);
    setInPlay([...inPlay].concat(cards));
    setTreasure(treasureCount);
    return newHand;
  },
  nextPhase = (card, count) => {
    let newHand = [];
    switch (phase) {
      case 'Action':
        let actionTotal = actions-1;
        if (card.actions) { actionTotal += card.actions };
        if (card.action) newHand = playCard(card, count);
        setActions(hasAction(newHand)? actionTotal : 0);
        if (!actionTotal || !hasAction(newHand)) setPhase('Buy');
        break;
      case 'Buy':
        if (card.treasure) {
          playCard(card, count);
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
  },
  instructions = phase === 'Action'?
    'Choose Actions to play' :
    phase === 'Discard'?
    'Select up to ? Card(s) to Trash' :
    phase === 'Buy'?
    `Choose Cards to Buy (${buys})` :
    '';

  window.onkeydown = e => {
    if (e.keyCode === 18) setAltKey(true);
  }
  window.onkeyup = e => {
    if (e.keyCode === 18) setAltKey(false);
  }

  return (
    <div className="App">
      <div className="supply-market"></div>
      <div className="log">
        <p>Log</p>
        <div className="breakline"/>
      </div>
      <div className="info">
        <span className="hidden">VP <span className='red'>{victoryPoints}</span> |&nbsp;</span>
        <span>Action <span className='red'>{actions}</span> |&nbsp;</span>
        <span>Buys <span className='red'>{buys}</span> |&nbsp;</span>
        <span>Coin <span className='coin'>{treasure}</span> </span>
      </div>
      <div
        className={`trash game-button ${trash.length > 0? 'active' : ''}`}
        onClick={() => {
          if (trash.length > 0) {
            setModalContent(trash);
            setShowModal(true);
          };
        }}
      >Trash ({trash.length})</div>
      <div className="in-play">{<CardDisplay sort={true} altKey={altKey} cards={inPlay}/>}</div>
      <div className="combo-mat"></div>
      <div className="button-display">
        <div>
          <div className="game-button red">{phase? `Your Turn - ${phase} Phase` : `P2's Turn`}</div>
          <p className="instructions red">{instructions}&nbsp;</p>
          <div className="game-button live" disabled={!turn} onClick={nextPhase}>
            {phase? `End ${phase} Phase` : 'Start Turn'}
          </div>
          <div
            className={`game-button live top-spaced ${phase === 'Buy' && treasureInHand() > 0? '' : ' hidden'}`}
            onClick={playTreasure}
          >
            {`Play All Treasure (${treasureInHand()})`}
          </div>
        </div>
        <div>
          <div className="breakline"/>
          <div className="deck">
            <p>Deck</p>
            <p>{deck.length}</p>
          </div>
          <div
            className={`deck ${discard.length > 0? 'active' : ''}`}
            onClick={() => {
              if (discard.length > 0) {
                setModalContent(discard);
                setShowModal(true);
              };
            }}
          >
            <p>Discard</p>
            <p>{discard.length}</p>
          </div>
        </div>
      </div>
      <div className="hand">
        {<CardDisplay
          altKey={altKey}
          stacked={true}
          sort={true}
          cards={hand}
          phase={phase}
          nextPhase={nextPhase}
        />}
      </div>
      {currentModal(modalContent)}
    </div>
  );
};

export default App;
