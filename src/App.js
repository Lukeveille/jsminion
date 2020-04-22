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
import instructions from './utils/instructions';
import treasureInHand from './utils/treasureInHand';
import cleanup from './utils/cleanup';
import rollover from './utils/rollover';
import moveCard from './utils/moveCard';
import CardDisplay from './components/CardDisplay';
import Modal from './components/Modal';
import CurrentModal from './components/CurrentModal';
import StartScreen from './components/StartScreen';
import './styles/App.css';

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
  // actionModal = (cards, accept, decline, buttonText, live) => {
  //   return <div>
  //     <CardDisplay
  //       altKey={altKey}
  //       onClick={accept}
  //       cards={cards}
  //       live={live}
  //       title={live? 'You may play' : `To ${buttonText}`}
  //     />
  //     <div
  //       className="game-button start-button live"
  //       onClick={decline}
  //     >
  //       {capital(buttonText)}
  //     </div>
  //   </div>
  // },
  [menuScreen, setMenuScreen] = useState(<StartScreen onClick={startGame} phaseTitle={"Let's Play"} start={true} button={'Start Game'} />),
  playAllTreasure = () => {
    const treasures = hand.filter(card => (card.type === 'Treasure')),
    newPlay = [...inPlay].concat(treasures),
    unique = (val, i, self) => ( self.indexOf(val) === i );

    let newLogs = [...logs],
    treasureNames = treasures.filter(unique),
    newHand = hand.filter(card => (card.type !== 'Treasure'));

    treasureNames.forEach(treasureCard => {
      newLogs = newLogs.concat(printLog(gameState, treasures.filter(card => (treasureCard.name === card.name))))
    });
    setTreasure(countTreasure(newPlay));
    setInPlay(newPlay);
    setHand(newHand);
    setLogs(newLogs);
  },
  gainCard = card => {
    const [newSupply, newDiscard] = moveCard(card, 1, supply, discard),
    newLog = [...logs].concat(generateLog(gameState, [card], 'gains', 1, true)),
    [cleanupLog, newActions, newPhase, newDiscardTrashQueue, newDiscardTrashState] = (cleanup(hand, actions, phase, gameState, newLog));
    setLogs(newLog.concat(cleanupLog));
    setPhase(newPhase)
    setDiscardTrashQueue(newDiscardTrashQueue);
    setDiscardTrashState(newDiscardTrashState);
    setActions(newActions);
    setSupply(newSupply);
    setDiscard(newDiscard);
    setTreasure(actionSupply.treasure);
    setActionSupply(false);
  },
  discardTrashCard = (card, size = 1) => {
    let newQueue = moveCard(card, size, hand, discardTrashQueue);
    setDiscardTrashQueue(newQueue[1]);
  },
  discardTrashCards = () => {
    let newHand = [...hand],
    rolloverCards,
    newPhase = phase,
    newLog = [...logs],
    newDiscard = [...discard],
    newTrash = [...trash],
    newDeck = [...deck],
    newDiscardTrashQueue = [...discardTrashQueue],
    newDiscardTrashState = {...discardTrashState},
    newActions = actions,
    newCoin = treasure,
    actionName = 'discards';

    discardTrashQueue.forEach(card => {
      newHand.splice(newHand.findIndex(i => (i === card)), 1);
    });
    
    if (newDiscardTrashState.type === 'discard') {
      newDiscard = newDiscard.concat(newDiscardTrashQueue);
      setDiscard(newDiscard);
    } else {
      actionName = 'trashes';
      newTrash = newTrash.concat(discardTrashQueue);
      setTrash(newTrash);
    };
    newLog = newLog.concat(generateLog(gameState, [{name: 'card'}], actionName, discardTrashQueue.length, true));
    
    if (newDiscardTrashState.next.length > 0) {
      const nextAction = newDiscardTrashState.next[0];
      switch (nextAction) {
        case 'draw':
          const newSize = !isNaN(newDiscardTrashState.next[1])? newDiscardTrashState.next[1] : discardTrashQueue.length;
          [rolloverCards, newDeck, newDiscard] = rollover(newSize, deck, discard);
          newHand = newHand.concat(rolloverCards);
          newLog = newLog.concat(generateLog(gameState, [{name: 'card'}], 'draws', discardTrashQueue.length, true));
          [newLog, newActions, newPhase, newDiscardTrashQueue, newDiscardTrashState] = cleanup(newHand, newActions, phase, gameState, newLog);
          break;
        case 'supply':
          const supplyMsg = newDiscardTrashState.card.supply.split(' ');
          newCoin = supplyMsg[0] === 'discardTrash'? discardTrashQueue[0].cost + parseInt(supplyMsg[1]): supplyMsg[0];
          setActionSupply({treasure, count: newDiscardTrashState.amount, restriction: supplyMsg[2]});
          newDiscardTrashQueue = [];
          break;
        default:
      }
    } else {
      [newLog, newActions, newPhase, newDiscardTrashQueue, newDiscardTrashState] = cleanup(newHand, newActions, phase, gameState, newLog);
    };

    setHand(newHand)
    setPhase(newPhase)
    setTreasure(newCoin)
    setDiscardTrashQueue(newDiscardTrashQueue);
    setDiscardTrashState(newDiscardTrashState);
    setActions(newActions);
    setDeck(newDeck);
    setLogs(newLog);
  },
  nextPhase = (card, count, supplyOn) => {
    let newHand = [...hand],
    newDeck = [...deck],
    newInPlay = [...inPlay],
    newLog = [...logs],
    newBuys = buys,
    newTreasure = countValue(inPlay, 'treasure'),
    newDiscard = [...discard];
    const size = phase === card.type? 1 : count;

    switch (phase) {
      case 'Action':
        let actionTotal = actions-1,
        newCards;
        [newHand, newInPlay, newCards] = moveCard(card, size, hand, inPlay);
        newTreasure += countTreasure(newCards)
        if (card.actions) { actionTotal += card.actions };
        if (card.type === 'Action') {
          let rolloverCards = [];
          if (card.cards) [rolloverCards, newDeck, newDiscard] = rollover(card.cards, newDeck, newDiscard);
          newHand = newHand.concat(rolloverCards)
          newLog = newLog.concat(printLog(gameState, [card]));
          if (card.buys) newBuys += card.buys;
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
                    let removal = newDeck.splice(discardTrash.index, actionObject.amount);
                    const decline = () => {
                      // setMenuScreen(null);
                      // setDeck(newDeck);
                      // setDiscard([...discard].concat(removal));
                    };
                    console.log(removal)
                    if (discardTrash.next === 'modal') {
                      // const cardLive = discardTrash.type === removal[0].type,
                      // accept = card => {
                        // setMenuScreen(null);
                        // setActions(actions + 1)
                        // playCard(card);
                        // setPhase('Action');
                      // };
                      // setMenuScreen(actionModal(removal, accept, decline, actionObject.type, cardLive));
                    } else {
                      decline();
                    }
                    break;
                  default: break;
                }
              } else {
                let actionName = 'discards';
                let removal = newHand.findIndex(i => (i.name === actionObject.restriction));
                if (removal === -1) newTreasure = 0;
                if (actionObject.type === 'discard') {
                  newDiscard = newDiscard.concat(newHand.splice(removal, actionObject.amount));
                } else {
                  setTrash([...trash].concat(newHand.splice(removal, actionObject.amount)));
                  actionName = 'trashes'
                };
                newLog = newLog.concat(generateLog(gameState, [{name: 'card'}], actionName, actionObject.amount, true))
              }
            } else {
              setDiscardTrashState(actionObject);
            };
          };
        }
        setActions(hasAction(newHand)? actionTotal : 0);

        const auto = card.discardTrash? card.discardTrash.split(' ').includes('auto')? true : false : true;

        if ((!actionTotal || !hasAction(newHand)) && auto) {
          newLog = newLog.concat(printLog(gameState, [{name: 'Buy Phase', end: 'enters'}]));
          setPhase('Buy');
        }
        break;

      case 'Buy':
        let buysLeft = buys,
        victory = victoryPoints;

        if (supplyOn) {
          let newSupply = [...supply],
          cardBought = supply.findIndex(i => (i === card));
          cardBought = newSupply.splice(cardBought, 1);

          const cardsLeft = newSupply.filter(newCard => newCard.name === card.name).length;
          victory = card.victory? victory + card.victory : victory;
          newDiscard = newDiscard.concat(cardBought);

          if (!cardsLeft) {
            setEmptySupply(emptySupply + 1);
            cardBought = {...cardBought[0], empty: true};
            newSupply = newSupply.concat(cardBought);

            if (card.name === 'Province' || emptySupply === 2) {
              setSupply(newSupply);
              setMenuScreen(<StartScreen onClick={startGame} phaseTitle={"Game Over"} victory={victory} button={'Play Again'} />)
              break;
            };
          };
          setSupply(newSupply);
          setBought(bought + card.cost);
          buysLeft = buysLeft - 1;
          newLog = newLog.concat(printLog(gameState, cardBought, 'buys'));
        } else if (card.type === 'Treasure') {
          let newCards;
          [newHand, newInPlay, newCards] = moveCard(card, size, hand, inPlay);
          newTreasure += countTreasure(newCards)
          newLog = newLog.concat(printLog(gameState, [card], null, count));
        } else {
          buysLeft = 0;
        };
        
        if (buysLeft < 1 || ((treasure - bought - card.cost) < 1 && supplyOn)) {
          const deckSplit = [...deck];
          buysLeft = 0;
          newInPlay = [];
          newDiscard = newDiscard.concat(inPlay).concat(hand);
          newHand = deckSplit.splice(0,5);

          if (deck.length > 5) {
            newDeck = deckSplit;
          } else {
            const shuffled = shuffle(newDiscard);
            newDiscard = [];
            newHand = newHand.concat(shuffled.splice(0, (5-newHand.length)));
            newDeck = shuffled;
          };
          setActions(0);
          setBought(0);
          newTreasure = 0;
          setPhase(null);
          setGameState({...gameState, turn: gameState.turn + 1});
          newLog = newLog.concat(printLog(gameState, [{name: 'turn', end: 'ends'}]));
        }
        newBuys = buysLeft;
        setVictoryPoints(victory);
        break;

      default:
        const setSpacer = gameState.turn === 1 && gameState.turnPlayer === 1? [] : spacer();
        newLog = newLog.concat(setSpacer.concat(printLog(gameState)));
        newBuys =  1;
        if (hasAction(hand)) {
          setActions(1);
          setPhase('Action');
        } else {
          setPhase('Buy');
          newLog = newLog.concat(printLog(gameState, [{name: 'Buy Phase', end: 'enters'}]));
        }
        break;
    };
    setHand(newHand);
    setInPlay(newInPlay);
    setDeck(newDeck);
    setBuys(newBuys);
    setDiscard(newDiscard);
    setTreasure(newTreasure);
    setLogs(newLog);
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
          <p className="instructions red">{instructions(phase, buys, discardTrashState, actionSupply)}&nbsp;</p>
          
          {actionSupply? '' : <div>

            <div
              className={discardTrashState || !phase? 'hidden' : treasureInHand(hand) > 0 && phase === 'Buy'? `game-button live` : 'button-space'}
              onClick={playAllTreasure}
            >
              {treasureInHand(hand) > 0 && phase === 'Buy'? `Play All Treasure (${treasureInHand(hand)})` : ' '}
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
      <CurrentModal showModal={showModal} setShowModal={setShowModal} altKey={altKey} modalContent={modalContent} />
    </div>
  );
};

export default App;
