import React from 'react';
import { useState } from 'react';
import { startingCards, supplies, standardGame } from './data/cardSets';
import { dotdotdot, spacer } from './utils/printLog';
import { generateLog } from './utils/printLog';
import printLog from './utils/printLog';
import shuffle from './utils/shuffle';
import countValue from './utils/countValue';
import hasAction from './utils/hasAction';
import countTreasure from './utils/countTreasure';
import CardDisplay from './components/CardDisplay';
import Modal from './components/Modal';
import './styles/App.css';

function App() {
  const player = 1,
  [phase, setPhase] = useState(),
  [showModal, setShowModal] = useState(false),
  [discardTrashState, setDiscardTrashState] = useState(null),
  [discardTrashQueue, setDiscardTrashQueue] = useState([]),
  [modalContent, setModalContent] = useState([[]]),
  [altKey, setAltKey] = useState(false),
  [logs, setLogs] = useState([]),
  [gameState, setGameState] = useState({turn: 1, player, turnPlayer: 1}),
  [deck, setDeck] = useState([]),
  [hand, setHand] = useState([]),
  [inPlay, setInPlay] = useState([]),
  [discard, setDiscard] = useState([]),
  [trash, setTrash] = useState([]),
  [supply, setSupply] = useState([]),
  [bought, setBought] = useState(0),
  [treasure, setTreasure] = useState(0),
  [actions, setActions] = useState(0),
  [buys, setBuys] = useState(0),
  [emptySupply, setEmptySupply] = useState(),
  [victoryPoints, setVictoryPoints] = useState(),
  instructions = () => {
    let message = '';
    if (discardTrashState) {
      const modifier = discardTrashState.modifier? `${discardTrashState.modifier.split('-').join(' ')} ` : '',
      plural = discardTrashState.amount && isNaN(discardTrashState.amount)? '(s)' : discardTrashState.amount > 1? 's' : '';
      message = `Select ${modifier}${discardTrashState.amount} card${plural} to ${discardTrashState.type}`;
    } else if (phase === 'Buy') {
      message = `Choose Cards to Buy (${buys})`;
    } else {
      message = 'Choose Actions to play';
    }
    return message;
  },
  logDisplay = () => {
    const shortLogs = logs.length > 16? dotdotdot.concat([...logs].splice(logs.length-16, 17)) : [...logs];
    return shortLogs.map(log => (log))
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
      children={<CardDisplay altKey={altKey} cards={cards[0]} title={modalContent[1]} />}
    />
  },
  treasureInHand = () => {
    const handTreasures = hand.filter(card => (card.type === 'Treasure'));
    return handTreasures.length;
  },
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
      newLogs = newLogs.concat(printLog(gameState, treasures.filter(card => (tresur.name === card.name))))
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
    size = phase === card.type? 1 : count,
    cards = newHand.splice(removal, size);
    
    treasureCount += countTreasure(cards);
    if (card.type === 'Action') {
      if (card.cards) { newHand = newHand.concat(rollover(card.cards)) };
      if (card.buys) { setBuys(buys + card.buys) };
      
      if (card.discard || card.trash) {

        let actionInfo = card.discard? card.discard.split(' ') : card.trash.split(' '),
        amount = actionInfo[0],
        modifier = '';
        
        if (amount.includes('|')){
          amount = amount.split('|');
          modifier = amount[1];
          amount = amount[0];
        };

        const actionObject = {
          type: card.discard? 'discard' : 'trash',
          amount,
          modifier,
          next: actionInfo[1],
          restriction: actionInfo[2]
        };
        setDiscardTrashState(actionObject);
      };
    }
    setHand(newHand);
    setInPlay([...inPlay].concat(cards));
    setTreasure(treasureCount);
    return newHand;
  },
  discardTrash = (card, size = 1) => {
    let newQueue = [...discardTrashQueue],
    newHand = [...hand];
    
    const removal = newHand.findIndex(i => (i === card)),
    cards = newHand.splice(removal, size);

    newQueue = newQueue.concat(cards);
    setDiscardTrashQueue(newQueue);
  },
  discardTrashCards = () => {
    const newHand = [...hand];
    let newLog = [...logs];
    discardTrashQueue.forEach(card => {
      newHand.splice(newHand.findIndex(i => (i === card)), 1);
    });

    let actionName = 'trashes';

    if (discardTrashState.type === 'discard') {
      const newDiscard = [...discard].concat(discardTrashQueue);
      actionName = 'discards';
      setDiscard(newDiscard);
    } else {
      const newTrash = [...trash].concat(discardTrashQueue);
      setTrash(newTrash);
    };
    newLog = newLog.concat(generateLog(gameState, [{name: 'card'}], actionName, discardTrashQueue.length, true));

    setDiscardTrashQueue([]);
    setDiscardTrashState(null);
    setHand(newHand);

    if (!actions || !hasAction(newHand)) {
      setPhase('Buy');
      setActions(0);
      newLog = newLog.concat(printLog(gameState, [{name: 'Buy Phase', end: 'enters'}]));
    }
    setLogs(newLog);
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
          cardLog = printLog(gameState, [card]);
        }

        setActions(hasAction(newHand)? actionTotal : 0);

        if ((!actionTotal || !hasAction(newHand)) && !card.trash && !card.discard) {
          cardLog = cardLog.concat(printLog(gameState, [{name: 'Buy Phase', end: 'enters'}]));
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
          cardLog = printLog(gameState, cardBought, 'buys');
        } else if (card.type === 'Treasure') {
          playCard(card, count);
          cardLog = printLog(gameState, [card], null, count);
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
          setGameState({...gameState, turn: gameState.turn + 1});
          cardLog = cardLog.concat(printLog(gameState, [{name: 'turn', end: 'ends'}]));
        }
        setBuys(buysLeft);
        setVictoryPoints(victory);
        setDiscard(discarded);
        break;

      default:
        const setSpacer = gameState.turn === 1 && gameState.turnPlayer === 1? [] : spacer();
        cardLog = setSpacer.concat(printLog(gameState));
        setBuys(1);
        if (hasAction(hand)) {
          setActions(1);
          setPhase('Action');
        } else {
          setPhase('Buy');
          cardLog = cardLog.concat(printLog(gameState, [{name: 'Buy Phase', end: 'enters'}]));
        }
        break;
    };
    setLogs([...logs].concat(cardLog));
  };

  window.onkeydown = e => {
    if (e.keyCode === 18) {
      setAltKey(true);
    } else if (e.keyCode === 27) {
      setShowModal(false);
    } else if (e.keyCode === 13) {
      if (menuScreen) startGame();
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
        <p className="log-title">Log</p>
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
            setModalContent([trash, 'Trash']);
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
          <p className="instructions red">{instructions()}&nbsp;</p>
          <div className="game-button live" onClick={discardTrashState? discardTrashCards : nextPhase}>
            {discardTrashState? `Confirm Card${isNaN(discardTrashState.amount) || discardTrashState.amount > 1? 's' : ''} to ${discardTrashState.type} (${discardTrashQueue.length})` : phase? `End ${phase} Phase` : 'Start Turn'}
          </div>
          <div
            className={`game-button live top-spaced ${(phase === 'Buy' && treasureInHand() > 0) || (discardTrashState && discardTrashQueue.length > 0)? '' : ' hidden'}`}
            onClick={discardTrashState? () => { setDiscardTrashQueue([]) } : playTreasure}
          >
            {discardTrashState? `Choose different cards` : `Play All Treasure (${treasureInHand()})`}
          </div>
        </div>
        <div>
          <div className="breakline"/>
          <div className="deck">
            <p>Deck ({deck.length})</p>
          </div>
          <div
            className={`deck ${discard.length > 0? 'active' : ''}`}
            onClick={() => {
              if (discard.length > 0) {
                setModalContent([discard, 'Discard']);
                setShowModal(true);
              };
            }}
          >
            <p>Discard ({discard.length})</p>
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
          onClick={discardTrashState? discardTrash : nextPhase}
          discardTrashState={discardTrashState}
          cardQueue={discardTrashQueue}
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
