import React from 'react';
import { useState } from 'react';
import { startingCards, supplies, standardGame } from './data/cardSets';
import { generateLog, spacer } from './utils/printLog';
import printLog from './utils/printLog';
import shuffle from './utils/shuffle';
import countValue from './utils/countValue';
import hasAction from './utils/hasAction';
import countTreasure from './utils/countTreasure';
import cleanup from './utils/cleanup';
import rollover from './utils/rollover';
import moveCard from './utils/moveCard';
import next from './utils/next';
import parseActionObject from './utils/parseActionObject';
import autoAction from './utils/autoAction';
import enterBuyPhase from './utils/enterBuyPhase';
import CardDisplay from './components/CardDisplay';
import LogDisplay from './components/LogDisplay';
import TurnInfo from './components/TurnInfo';
import TrashButton from './components/TrashButton';
import ButtonDisplay from './components/ButtonDisplay';
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
    setHand(startingDeck.splice(0, 5));
    setDeck(startingDeck);
    setSupply(supplies(standardGame));
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
  [menuScreen, setMenuScreen] = useState(
    <StartScreen
      onClick={startGame}
      phaseTitle={"Let's Play"}
      start={true}
      button={'Start Game'}
    />
  ),
  playAllTreasure = () => {
    const treasures = hand.filter(card => (card.type === 'Treasure')),
    newPlay = [...inPlay].concat(treasures),
    unique = (val, i, self) => ( self.indexOf(val) === i );

    let newLogs = [...logs],
    treasureNames = treasures.filter(unique),
    newHand = hand.filter(card => (card.type !== 'Treasure'));

    treasureNames.forEach(treasureCard => {
      newLogs = newLogs.concat(printLog(gameState, treasures.filter(
        card => (treasureCard.name === card.name)
      )));
    });
    setTreasure(countTreasure(newPlay));
    setInPlay(newPlay);
    setHand(newHand);
    setLogs(newLogs);
  },
  gainCard = card => {
    let newLog = [...logs].concat(generateLog(gameState, [card], 'gains', 1, true));
    const [newSupply, newDiscard] = moveCard(card, 1, supply, discard),
    [ cleanupLog,
      newActions,
      newPhase,
      newDiscardTrashQueue,
      newDiscardTrashState
    ] = cleanup(hand, actions, phase, gameState, newLog);
    
    setLogs(cleanupLog);
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
    newLog = newLog.concat(generateLog(
      gameState,
      [{name: 'Card'}],
      actionName,
      discardTrashQueue.length,
      true
    ));
    if (newDiscardTrashState.next.length > 0) {
      [ newHand,
        newLog,
        newCoin,
        newPhase,
        newActions,
        newDiscardTrashQueue,
        newDiscardTrashState
      ] = next(
        gameState,
        newDiscardTrashState,
        newDiscardTrashQueue,
        newDeck,
        newDiscard,
        newHand,
        newPhase,
        newCoin,
        newLog,
        newActions,
        setActionSupply
      );
    } else {
      [ newLog,
        newActions,
        newPhase,
        newDiscardTrashQueue,
        newDiscardTrashState
      ] = cleanup(newHand, newActions, phase, gameState, newLog);
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
    newPhase = phase,
    actionTotal = actions,
    newTreasure = countValue(inPlay, 'treasure'),
    newDiscard = [...discard],
    newTrash = [...trash];
    const size = phase === card.type? 1 : count;

    switch (phase) {
      case 'Action':
        if (card.type === phase) {
          let rolloverCards = [],
          newCards;

          newLog = newLog.concat(printLog(gameState, [card]));
          actionTotal = actionTotal-1;
          
          [newHand, newInPlay, newCards] = moveCard(card, size, hand, inPlay);
          newTreasure += countTreasure(newCards);

          if (card.actions) actionTotal += card.actions;
          if (card.buys) newBuys += card.buys;
          if (card.cards) {
            [rolloverCards, newDeck, newDiscard] = rollover(card.cards, newDeck, newDiscard);
            newHand = newHand.concat(rolloverCards);
          };
          
          const actionObject = card.discardTrash? parseActionObject(card) : false;
          
          let checkHandForActions = !hasAction(newHand);
          if (actionObject) {
            if (actionObject.next && actionObject.next[0] === 'auto') {
              [ newHand, 
                newDeck, 
                newDiscard, 
                newTrash,
                newTreasure,
                newLog,
                checkHandForActions,
                actionTotal
              ] = autoAction(
                card,
                gameState,
                actionObject,
                newDeck,
                newDiscard,
                newTrash,
                newHand,
                newTreasure,
                newLog,
                setMenuScreen,
                setDiscardTrashState,
                actionTotal
              );
            } else {
              checkHandForActions = false;
              setDiscardTrashState(actionObject);
            };
          };
          const auto = actionObject? actionObject.next && actionObject.next[0] === 'auto'? true : false : true;
          
          console.log(checkHandForActions);
          
          if ((!actionTotal || checkHandForActions) && auto) {
            [newLog, newPhase, actionTotal] = enterBuyPhase(gameState, newLog);
          };
        } else {
          [newLog, newPhase, actionTotal] = enterBuyPhase(gameState, newLog);
        };
        break;
      case 'Buy':
        let buysLeft = buys,
        newVictoryPoints = victoryPoints;

        if (supplyOn) {
          let newSupply, cardBought;
          [newSupply, newDiscard, cardBought] = moveCard(card, 1, supply, newDiscard)

          const cardsLeft = newSupply.filter(newCard => newCard.name === card.name).length;
          newVictoryPoints = card.victory? newVictoryPoints + card.victory : newVictoryPoints;

          if (!cardsLeft) {
            setEmptySupply(emptySupply + 1);
            cardBought = {...cardBought[0], empty: true};
            newSupply = newSupply.concat(cardBought);

            if (card.name === 'Province' || emptySupply === 2) {
              setSupply(newSupply);
              setMenuScreen(
                <StartScreen
                  onClick={startGame}
                  phaseTitle={"Game Over"}
                  victory={newVictoryPoints}
                  button={'Play Again'}
                />
              );
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
          actionTotal = 0;
          setBought(0);
          newTreasure = 0;
          newPhase = null;
          setGameState({...gameState, turn: gameState.turn + 1});
          newLog = newLog.concat(printLog(gameState, [{name: 'turn', end: 'ends'}]));
        };
        newBuys = buysLeft;
        setVictoryPoints(newVictoryPoints);
        break;

      default:
        const setSpacer = gameState.turn === 1 && gameState.turnPlayer === 1? [] : spacer();
        newLog = newLog.concat(setSpacer.concat(printLog(gameState)));
        newBuys =  1;
        if (hasAction(hand)) {
          actionTotal = 1;
          newPhase = 'Action';
        } else {
          [newLog, newPhase] = enterBuyPhase(gameState, newLog);
        }
        break;
    };
    setActions(actionTotal);
    setPhase(newPhase)
    setHand(newHand);
    setInPlay(newInPlay);
    setDeck(newDeck);
    setBuys(newBuys);
    setDiscard(newDiscard);
    setTrash(newTrash);
    setTreasure(newTreasure);
    setLogs(newLog);
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
      <LogDisplay logs={logs} />
      <TurnInfo
        victoryPoints={victoryPoints}
        actions={actions}
        buys={buys}
        treasure={treasure}
        bought={bought}
      />
      <TrashButton
        trash={trash}
        setModalContent={setModalContent}
        setShowModal={setShowModal}
      />
      <div className="in-play">
        <CardDisplay sort={true} altKey={altKey} cards={inPlay}/>
      </div>
      <div className="combo-mat"></div>
      <ButtonDisplay
        buys={buys}
        actionSupply={actionSupply}
        hand={hand}
        phase={phase}
        discardTrashState={discardTrashState}
        discardTrashQueue={discardTrashQueue}
        setDiscardTrashQueue={setDiscardTrashQueue}
        deck={deck}
        setModalContent={setModalContent}
        setShowModal={setShowModal}
        discard={discard}
        playAllTreasure={playAllTreasure}
        discardTrashCards={discardTrashCards}
        startGame={startGame}
        nextPhase={nextPhase}
      />
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
      <CurrentModal
        showModal={showModal}
        setShowModal={setShowModal}
        altKey={altKey}
        modalContent={modalContent}
      />
    </div>
  );
};

export default App;
