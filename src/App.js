import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useState } from 'react';
import shuffle from './utils/shuffle';
import countValue from './utils/countValue';
import hasAction from './utils/hasAction';
import countTreasure from './utils/countTreasure';
import { startingCards, supplies, standardGame } from './data/cardSets';
import CardDisplay from './components/CardDisplay';
import Modal from './components/Modal';
import './styles/App.css';

function App() {
  const [phase, setPhase] = useState(),
  [showModal, setShowModal] = useState(false),
  [modalContent, setModalContent] = useState([]),
  [altKey, setAltKey] = useState(false),
  [thisPlayer] = useState(1),
  [logs, setLogs] = useState([]),
  [currentPlayer] = useState(1),
  [turnNumber, setTurnNumber] = useState(1),
  [deck, setDeck] = useState([]),
  [hand, setHand] = useState([]),
  [inPlay, setInPlay] = useState([]),
  [discard, setDiscard] = useState([]),
  [trash] = useState([]),
  [supply, setSupply] = useState([]),
  [bought, setBought] = useState(0),
  [treasure, setTreasure] = useState(0),
  [actions, setActions] = useState(0),
  [buys, setBuys] = useState(0),
  [emptySupply, setEmptySupply] = useState(),
  colors = ['red', 'blue', 'orange', 'green'],
  printLog = (cards, cardAction, num) => {
    const size = num? num : cards? cards.length : 1;
    let action = cards && cards[0].end? cards[0].end : cardAction? cardAction : 'plays';

    return [
      <div
        className="log"
        key={`log${uuidv4().slice(0,8)}`}
      >
        <p className={`${cards? '' : 'turn-log'}`}>
          {cards? '' : <span>Turn {turnNumber} -&nbsp;</span>}
          <span className={`${colors[currentPlayer-1]}`}>P{thisPlayer}</span>
          {cards? <span> {action} {cards && cards[0].end? 'their' : size === 1? 'a' : size} {cards[0].name}</span> : ''}
        </p>
      </div>
    ];
  },
  startGame = () => {
    const startingDeck = shuffle(startingCards());
    setVictoryPoints(countValue(startingDeck, 'victory'));
    const startingHand = startingDeck.splice(0, 5);
    setSupply(supplies(standardGame));
    setHand(startingHand);
    setDeck(startingDeck);
    setDiscard([]);
    setInPlay([]);
    setMenuScreen(null);
    setPhase(null);
    setEmptySupply(0);
    setTreasure(0);
    setBuys(0);
  },
  startScreen = <div>
    <h2 className="title">Let's Play</h2>
    <h1>Dominion</h1>
    <div
      className="game-button start-button live"
      onClick={startGame}
    >
      Start Game
    </div>
  </div>,
  [menuScreen, setMenuScreen] = useState(startScreen),
  currentModal = cards => {
    return <Modal
      close={true}
      show={showModal}
      setShow={setShowModal}
      children={<CardDisplay altKey={altKey} cards={cards} />}
    />
  },
  treasureInHand = () => {
    const handTreasures = hand.filter(card => (card.type === 'Treasure'));
    return handTreasures.length;
  },
  [victoryPoints, setVictoryPoints] = useState(),
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
    const treasures = hand.filter(card => (card.type === 'Treasure')),
    newPlay = [...inPlay].concat(treasures),
    unique = (val, i, self) => ( self.indexOf(val) === i );

    let newLogs = [...logs],
    treasureNames = treasures.filter(unique),
    newHand = hand.filter(card => (card.type !== 'Treasure'));

    treasureNames.forEach(tresur => {
      newLogs = newLogs.concat(printLog(treasures.filter(card => (tresur.name === card.name))))
    });
    setTreasure(countTreasure(newPlay));
    setInPlay(newPlay);
    setHand(newHand);
    setLogs(newLogs);
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
  nextPhase = (card, count, supplyOn) => {
    let newHand = [],
    cardLog = [];

    switch (phase) {
      case 'Action':
        let actionTotal = actions-1;
        if (card.actions) { actionTotal += card.actions };
        if (card.type === 'Action') {
          newHand = playCard(card, count);
          cardLog = printLog([card]);
        }
        setActions(hasAction(newHand)? actionTotal : 0);
        if (!actionTotal || !hasAction(newHand)) {
          cardLog = [cardLog, printLog([{name: 'Buy Phase', end: 'enters'}])];
          setPhase('Buy');
        }
        break;

      case 'Buy':
        let buysLeft = buys,
        victory = victoryPoints,
        discarded = discard;

        if (supplyOn) {
          let newSupply = [...supply],
          cardBought = supply.findIndex(i => (i === card));
          cardBought = newSupply.splice(cardBought, 1);

          const cardsLeft = newSupply.filter(newCard => newCard.name === card.name).length;
          victory = card.victory? victory + card.victory : victory;
          discarded = [...discard].concat(cardBought);

          if (!cardsLeft) {
            setEmptySupply(emptySupply + 1);
            cardBought = {...cardBought[0], empty: true};
            newSupply = newSupply.concat(cardBought);

            if (card.name === 'Province' || emptySupply === 2) {
              setSupply(newSupply);
              setMenuScreen(
                <div>
                  <h1 className="title">Game Over</h1>
                  <p>{victory} Victory Points!</p>
                  <div
                    className="game-button start-button live"
                    onClick={startGame}
                  >
                    Play Again
                  </div>
                </div>
              );
              break;
            };
          };
          setSupply(newSupply);
          setBought(bought + card.cost);
          buysLeft = buysLeft - 1;
          cardLog = printLog(cardBought, 'buys');
        } else if (card.type === 'Treasure') {
          playCard(card, count);
          cardLog = printLog([card], null, count);
        } else {
          buysLeft = 0;
          cardLog = []
        };
        
        if (buysLeft < 1 || ((treasure - bought - card.cost) < 1 && supplyOn)) {
          const deckSplit = [...deck];
          buysLeft = 0;
          setInPlay([]);
          discarded = discarded.concat(inPlay).concat(hand);
          newHand = deckSplit.splice(0,5);

          if (deck.length > 5) {
            setDeck(deckSplit);
          } else if (deck.length > 0) {
            const shuffled = shuffle(discarded);
            discarded = [];
            newHand = newHand.concat(shuffled.splice(0, (5-newHand.length)));
            setDeck(shuffled);
          };
          setHand(newHand);
          setActions(0);
          setBought(0);
          setTreasure(0);
          setPhase(null);
          setTurnNumber(turnNumber + 1);
          cardLog = [
            cardLog,
            printLog([{name: 'turn', end: 'ends'}])
          ];
        }
        setBuys(buysLeft);
        setVictoryPoints(victory);
        setDiscard(discarded);
        break;

      default:
        const spacer = turnNumber === 1 && currentPlayer === 1? [] : <div key={`log${uuidv4().slice(0,8)}`} className="spacer"/>
        cardLog = [spacer, printLog()];
        setBuys(1);
        if (hasAction(hand)) {
          setActions(1);
          setPhase('Action');
        } else {
          setPhase('Buy');
          cardLog = [cardLog, printLog([{name: 'Buy Phase', end: 'enters'}])];
        }
        break;
    };

    setLogs([...logs].concat(cardLog));
  },
  instructions = phase === 'Action'?
  'Choose Actions to play' :
  phase === 'Discard'?
  'Select up to ? Card(s) to Trash' :
  phase === 'Buy'?
  `Choose Cards to Buy (${buys})` :
  '',
  logDisplay = () => {
    const reduced = logs.length > 1? [...logs].reduce((prev, cur) => ( prev.concat(cur) )) : [...logs],
    shorter = reduced.length > 13? dotdotdot.concat([...reduced].splice(reduced.length-12, 12)) : [...reduced];
    return shorter.map(log => (log))
  },
  dotdotdot = [<p key={`log${uuidv4().slice(0,8)}`}>...</p>];

  window.onkeydown = e => {
    if (e.keyCode === 18) {
      setAltKey(true);
    } else if (e.keyCode === 27) {
      setShowModal(false);
    };
  };
  window.onkeyup = e => {
    if (e.keyCode === 18) setAltKey(false);
  };

  return (
    <div className="App">
      <div className="supply-market">
        <CardDisplay
          coin={treasure - bought}
          phase={phase}
          onClick={nextPhase}
          sort={true}
          supply={true}
          altKey={altKey}
          cards={supply}
        />
      </div>
      <div className="logs">
        <p>Log</p>
        <div className="breakline"/>
        <div className="log-readout">
          {logDisplay()}
        </div>
      </div>
      <div className="info">
        <span className="hidden">VP <span className='red'>{victoryPoints}</span> |&nbsp;</span>
        <span>Action <span className='red'>{actions}</span> |&nbsp;</span>
        <span>Buys <span className='red'>{buys}</span> |&nbsp;</span>
        <span>Coin <span className='coin'>{treasure - bought}</span> </span>
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
      <div className="in-play">
        <CardDisplay sort={true} altKey={altKey} cards={inPlay}/>
      </div>
      <div className="combo-mat"></div>
      <div className="button-display">
        <div>
          <div className="game-button red">{phase? `Your Turn - ${phase} Phase` : `P2's Turn`}</div>
          <p className="instructions red">{instructions}&nbsp;</p>
          <div className="game-button live" onClick={nextPhase}>
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
        <CardDisplay
          altKey={altKey}
          stacked={true}
          sort={true}
          cards={hand}
          phase={phase}
          onClick={nextPhase}
        />
      </div>
      <Modal
        show={menuScreen? true : false}
        setShow={() => {}}
        children={menuScreen}
      />
      {currentModal(modalContent)}
    </div>
  );
};

export default App;
