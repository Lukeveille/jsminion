import React from 'react';
import { useState, useEffect } from 'react';
import { startingCards, supplies, standardGame } from './data/cardSets';
import { spacer } from './utils/printLog';
import { generateLog } from './utils/printLog';
import printLog from './utils/printLog';
import shuffle from './utils/shuffle';
import countValue from './utils/countValue';
import hasAction from './utils/hasAction';
import countTreasure from './utils/countTreasure';
import CardDisplay from './components/CardDisplay';
import Modal from './components/Modal';
import './styles/App.css';
import capital from './utils/capital';

function App() {
  const player = 1,
  [phase, setPhase] = useState(),
  [showModal, setShowModal] = useState(false),
  [discardTrashState, setDiscardTrashState] = useState(false),
  [discardTrashQueue, setDiscardTrashQueue] = useState([]),
  [modalContent, setModalContent] = useState([[]]),
  [altKey, setAltKey] = useState(false),
  [actionSupply, setActionSupply] = useState(false),
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
      message = `Select ${modifier}${discardTrashState.amount} card${plural}${actionSupply? '' : ` to ${discardTrashState.type}`}`;
    } else if (actionSupply) {
      message = `Choose a Card`;
    } else if (phase === 'Buy') {
      message = `Choose Cards to Buy (${buys})`;
    } else {
      message = 'Choose Actions to play';
    }
    return message;
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
    setLogs([]);
    setTrash([]);
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
  actionModal = (cards, accept, decline, buttonText, live) => {
    return <div>
      <CardDisplay
        altKey={altKey}
        onClick={accept}
        cards={cards}
        live={live}
        title={live? 'You may play' : `To ${buttonText}`}
      />
      <div
        className="game-button start-button live"
        onClick={decline}
      >
        {capital(buttonText)}
      </div>
    </div>
  },
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
    } else {
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
  playCard = (card, count, log) => {
    let newHand = [...hand],
    treasureCount = countValue(inPlay, 'treasure'),
    removal = newHand.findIndex(i => (i === card)),
    cardLog = log;

    const size = phase === card.type? 1 : count,
    cards = newHand.splice(removal, size);
    
    treasureCount += countTreasure(cards);
    if (card.type === 'Action') {
      if (card.cards) { newHand = newHand.concat(rollover(card.cards)) };
      if (card.buys) { setBuys(buys + card.buys) };
      if (card.discardTrash) {
        let actionInfo = card.discardTrash.split(' '),
        amount = actionInfo[1],
        modifier = '';
        if (amount.includes('|')){
          amount = amount.split('|');
          modifier = amount[1];
          amount = amount[0];
        };
        amount = isNaN(amount)? amount : parseInt(amount);
        const actionObject = {
          card,
          type: actionInfo[0],
          amount,
          modifier,
          next: actionInfo[2]? [actionInfo[2], card[actionInfo[2]]] : [],
          restriction: actionInfo[3]
        };
        if (actionObject.next && actionObject.next[0] === 'auto') {
          if (actionObject.modifier && actionObject.modifier !== 'up-to') {
            switch (actionObject.modifier) {
              case 'deck':
                let discardTrash = card.deck.split(' '),
                newDeck = [...deck];
                discardTrash = {
                  index: discardTrash[0],
                  next: discardTrash[1],
                  type: discardTrash[2]
                };
                removal = newDeck.splice(discardTrash.index, actionObject.amount);
                const decline = () => {
                  setMenuScreen(null);
                  setDeck(newDeck);
                  setDiscard([...discard].concat(removal));
                };
                if (discardTrash.next === 'modal') {
                  const cardLive = discardTrash.type === removal[0].type,
                  accept = card => {
                    setMenuScreen(null);
                    // setActions(actions + 1)
                    // playCard(card);
                    // setPhase('Action');
                  };
                  setMenuScreen(actionModal(removal, accept, decline, actionObject.type, cardLive));
                } else {
                  decline();
                }
                break;
              default: break;
            }
          } else {
            let actionName = 'discards';
            
            removal = newHand.findIndex(i => (i.name === actionObject.restriction));

            if (removal === -1) treasureCount = 0;

            if (actionObject.type === 'discard') {
              setDiscard([...discard].concat(newHand.splice(removal, actionObject.amount)));
            } else {
              setTrash([...trash].concat(newHand.splice(removal, actionObject.amount)));
              actionName = 'trashes'
            };
            cardLog = cardLog.concat(generateLog(gameState, [{name: 'card'}], actionName, actionObject.amount, true))
          }
        } else {
          setDiscardTrashState(actionObject);
        };
      };
    };
    setHand(newHand);
    setInPlay([...inPlay].concat(cards));
    setTreasure(treasureCount);
    return [newHand, cardLog];
  },
  discardTrashCard = (card, size = 1) => {
    let newQueue = [...discardTrashQueue],
    newHand = [...hand];
    
    const removal = newHand.findIndex(i => (i === card)),
    cards = newHand.splice(removal, size);

    newQueue = newQueue.concat(cards);
    setDiscardTrashQueue(newQueue);
  },
  discardTrashCards = () => {
    let newHand = [...hand],
    newLog = [...logs],
    actionName = 'trashes';
    discardTrashQueue.forEach(card => {
      newHand.splice(newHand.findIndex(i => (i === card)), 1);
    });

    if (discardTrashState.type === 'discard') {
      const newDiscard = [...discard].concat(discardTrashQueue);
      actionName = 'discards';
      setDiscard(newDiscard);
    } else {
      const newTrash = [...trash].concat(discardTrashQueue);
      setTrash(newTrash);
    };
    newLog = newLog.concat(generateLog(gameState, [{name: 'card'}], actionName, discardTrashQueue.length, true));
    newLog = next(discardTrashState, newHand, newLog);
    setLogs(newLog);
  },
  next = (state, newHand, newLog) => {
    if (state.next.length > 0) {
      const nextAction = discardTrashState.next[0];
      switch (nextAction) {
        case 'draw':
          const newSize = !isNaN(discardTrashState.next[1])? discardTrashState.next[1] : discardTrashQueue.length;
          newHand = newHand.concat(rollover(newSize));
          newLog = newLog.concat(generateLog(gameState, [{name: 'card'}], 'draws', discardTrashQueue.length, true));
          newLog = newLog.concat(cleanup(newHand));
          break;
        case 'supply':
          const supplyMsg = discardTrashState.card.supply.split(' ');
          let newCoin = supplyMsg[0] === 'discardTrash'? discardTrashQueue[0].cost + parseInt(supplyMsg[1]): supplyMsg[0];
          setActionSupply({treasure, count: discardTrashState.amount, restriction: supplyMsg[2]});
          setTreasure(newCoin);
          setHand(newHand);
          setDiscardTrashQueue([]);
          break;
        default:
      }
    } else {
      newLog = newLog.concat(cleanup(newHand));
    }
    return newLog;
  },
  gainCard = card => {
    let newSupply = [...supply],
    newLog = [...logs].concat(generateLog(gameState, [card], 'gains', 1, true));
    const removal = newSupply.findIndex(i => (i === card)),
    cardGained = newSupply.splice(removal, 1);

    setSupply(newSupply);
    setDiscard([...discard].concat(cardGained));
    setTreasure(actionSupply.treasure);
    setActionSupply(false);
    setLogs(newLog.concat(cleanup(hand)));
  },
  cleanup = newHand => {
    let newLog = [];
    setDiscardTrashQueue([]);
    setDiscardTrashState(false);
    if (!actions || !hasAction(newHand)) {
      setPhase('Buy');
      setActions(0);
      newLog = newLog.concat(printLog(gameState, [{name: 'Buy Phase', end: 'enters'}]));
    };
    setHand(newHand);
    return newLog;
  },
  nextPhase = (card, count, supplyOn, oldPlay) => {
    let newHand = [],
    cardLog = [];

    switch (phase) {
      case 'Action':
        let actionTotal = actions-1;
        if (card.actions) { actionTotal += card.actions };
        if (card.type === 'Action') {
          cardLog = cardLog.concat(printLog(gameState, [card]));
          [newHand, cardLog] = playCard(card, count, cardLog);
        }
        setActions(hasAction(newHand)? actionTotal : 0);

        const auto = card.discardTrash? card.discardTrash.split(' ').includes('auto')? true : false : true;

        if ((!actionTotal || !hasAction(newHand)) && auto) {
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
          } else {
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
  },
  noLimit = discardTrashState && (discardTrashState.modifier === 'up-to' || discardTrashState.amount === 'any'),
  rightAmount = discardTrashState && discardTrashState.amount === discardTrashQueue.length,
  logSticker = document.getElementById('log-sticker');

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

  useEffect(() => {
    if (logSticker) logSticker.scrollIntoView();
  }, [logs, logSticker]);

  return (
    <div className="App">
      <div className="supply-market">
        <CardDisplay
          coin={treasure - bought}
          phase={actionSupply? 'supply' : phase}
          onClick={actionSupply? gainCard : nextPhase}
          actionSupply={actionSupply}
          sort={true}
          supply={true}
          altKey={altKey}
          cards={supply}
          restriction={discardTrashState? discardTrashState.restriction : undefined}
        />
      </div>
      <div className="logs">
        <p className="log-title">Log</p>
        <div className="breakline"/>
        <div className="log-readout">
          {logs.length >1? logs : <div className="spacer"/>}
          <div id="log-sticker" />
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
          
          {actionSupply? '' : <div>

            <div
              className={discardTrashState || !phase? 'hidden' : treasureInHand() > 0 && phase === 'Buy'? `game-button live` : 'button-space'}
              onClick={playTreasure}
            >
              {treasureInHand() > 0 && phase === 'Buy'? `Play All Treasure (${treasureInHand()})` : ' '}
            </div>

            <div
              className={`game-button ${discardTrashState? noLimit || rightAmount? '' : 'not-' : ''}live${discardTrashState || !phase? '' : ' top-spaced'}`}
              onClick={discardTrashState? noLimit || rightAmount? discardTrashCards : () => {} : nextPhase}
            >
              {discardTrashState? `Confirm Card${isNaN(discardTrashState.amount) || discardTrashState.amount > 1? 's' : ''} to ${discardTrashState.type} (${discardTrashQueue.length})` : phase? `End ${phase} Phase` : 'Start Turn'}
            </div>

            <div
              className={`game-button live top-spaced ${(discardTrashState && discardTrashQueue.length > 0)? '' : ' hidden'}`}
              onClick={() => {setDiscardTrashQueue([])}}
            >
              {`Choose different cards`}
            </div>
          </div>}
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
          onClick={discardTrashState? discardTrashCard : nextPhase}
          discardTrashState={discardTrashState}
          actionSupply={actionSupply}
          restriction={discardTrashState? discardTrashState.restriction : undefined}
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
