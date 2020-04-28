import React from 'react';
import { useState } from 'react';
import { startingCards, supplies, standardGame } from './data/cardSets';
import { generateLog, spacer } from './utils/printLog';
import printLog from './utils/printLog';
import shuffle from './utils/shuffle';
import countValue from './utils/countValue';
import hasType from './utils/hasType';
import cleanup from './utils/cleanup';
import rollover from './utils/rollover';
import moveCard from './utils/moveCard';
import next from './utils/next';
import enterBuyPhase from './utils/enterBuyPhase';
import playAction from './utils/playAction';
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
  [gameState, setGameState] = useState({turn: 0, player, turnPlayer: 1}),
  [deck, setDeck] = useState([]),
  [hand, setHand] = useState([]),
  [inPlay, setInPlay] = useState([]),
  [discard, setDiscard] = useState([]),
  [coinMod, setCoinMod] = useState(0),
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
    setGameState({...gameState, turn: 1})
  },
  [menuScreen, setMenuScreen] = useState(
    <StartScreen
      onClick={startGame}
      phaseTitle={"Let's Play"}
      start={true}
      button={'Start Game'}
    />
  );
  let turnObject = {
    gameState,
    hand: [...hand],
    deck: [...deck],
    discard: [...discard],
    trash: [...trash],
    inPlay: [...inPlay],
    logs: [...logs],
    supply: [...supply],
    discardTrashQueue: [...discardTrashQueue],
    discardTrashState: discardTrashState? {...discardTrashState} : false,
    actions,
    buys,
    treasure,
    phase,
    menuScreen,
    coinMod
  };
  const playAllTreasure = () => {
    const treasures = hand.filter(card => (card.type === 'Treasure')),
    newPlay = [...inPlay].concat(treasures),
    unique = (val, i, self) => (self.indexOf(val) === i),
    treasureNames = treasures.filter(unique),
    newHand = hand.filter(card => (card.type !== 'Treasure'));

    let newLogs = [...logs];

    treasureNames.forEach(treasureCard => {
      newLogs = newLogs.concat(printLog(gameState, treasures.filter(
        card => (treasureCard.name === card.name)
      )));
    });
    setTreasure(countValue(newPlay, 'treasure'));
    setInPlay(newPlay);
    setHand(newHand);
    setLogs(newLogs);
  },
  gainCard = card => {
    turnObject.logs = turnObject.logs.concat(generateLog(gameState, [card], 'gains', 1, true));
    [turnObject.supply, turnObject.discard] = moveCard(card, 1, supply, discard);
    turnObject.treasure = actionSupply.treasure;
    turnObject = cleanup(turnObject);
    
    setTurnState(turnObject);
    setDiscardTrashQueue(turnObject.discardTrashQueue);
    setDiscardTrashState(turnObject.discardTrashState);
    setActionSupply(false);
  },
  discardTrashCard = (card, size = 1) => {
    let newQueue = moveCard(card, size, hand, discardTrashQueue);
    setDiscardTrashQueue(newQueue[1]);
  },
  discardTrashCards = () => {
    let actionName = 'discards';
    discardTrashQueue.forEach(card => {
      turnObject.hand.splice(turnObject.hand.findIndex(i => (i === card)), 1);
    });
    if (turnObject.discardTrashState.type === 'discard') {
      turnObject.discard = turnObject.discard.concat(discardTrashQueue);
      setDiscard(turnObject.discard);
    } else {
      actionName = 'trashes';
      turnObject.trash = turnObject.trash.concat(discardTrashQueue);
      setTrash(turnObject.trash);
    };
    turnObject.logs = turnObject.logs.concat(generateLog(
      gameState,
      [{name: 'Card'}],
      actionName,
      discardTrashQueue.length,
      true
    ));
    if (turnObject.discardTrashState.next.length > 0) {
      turnObject = next(turnObject, setActionSupply);
    } else {
      turnObject = cleanup(turnObject);
    };

    setTurnState(turnObject);
    setDiscardTrashQueue(turnObject.discardTrashQueue);
    setDiscardTrashState(turnObject.discardTrashState);
  },
  nextPhase = (card, count, supplyOn) => {
    turnObject.treasure = countValue(inPlay, 'treasure');
    const size = phase === card.type? 1 : count;

    switch (phase) {
      case 'Action':
        const setters = {
          setDiscardTrashState,
          setPhase,
          setTurnState
        };
        if (card.type === phase) {
          turnObject = playAction(card, size, turnObject, setters);
        } else {
          [turnObject.logs, turnObject.phase, turnObject.actions] = enterBuyPhase(gameState, turnObject.logs);
        };
        break;
      case 'Buy':
        let buysLeft = buys,
        newVictoryPoints = victoryPoints;

        if (supplyOn) {
          let cardBought;
          [turnObject.supply, turnObject.discard, cardBought] = moveCard(card, 1, supply, turnObject.discard)

          const cardsLeft = turnObject.supply.filter(newCard => newCard.name === card.name).length;
          newVictoryPoints = card.victory? newVictoryPoints + card.victory : newVictoryPoints;

          if (!cardsLeft) {
            setEmptySupply(emptySupply + 1);
            cardBought = {...cardBought[0], empty: true};
            turnObject.supply = turnObject.supply.concat(cardBought);

            if (card.name === 'Province' || emptySupply === 2) {
              setSupply(turnObject.supply);
              setGameState({...gameState, turn: 0})
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
          setSupply(turnObject.supply);
          setBought(bought + card.cost);
          buysLeft = buysLeft - 1;
          turnObject.logs = turnObject.logs.concat(printLog(gameState, cardBought, 'buys'));
        } else if (card.type === 'Treasure') {
          let newCards;
          [turnObject.hand, turnObject.inPlay, newCards] = moveCard(card, size, hand, inPlay);
          turnObject.treasure += countValue(newCards, 'treasure')
          turnObject.logs = turnObject.logs.concat(printLog(gameState, [card], null, count));
        } else {
          buysLeft = 0;
        };
        
        if (buysLeft < 1 || ((treasure - bought - card.cost) < 1 && supplyOn)) {
          const deckSplit = [...deck];
          turnObject = {...turnObject,
            inPlay: [],
            discard: turnObject.discard.concat(inPlay).concat(hand),
            hand: deckSplit.splice(0,5)
          };
          buysLeft = 0;
          [turnObject.hand, turnObject.deck, turnObject.discard] = rollover(5, turnObject.deck, turnObject.discard);
          turnObject = {...turnObject, 
            actions: 0,
            treasure: 0,
            coinMod: 0,
            phase: null,
            logs: turnObject.logs.concat(printLog(gameState, [{name: 'turn', end: 'ends'}]))
          };
          setBought(0);
          setGameState({...gameState, turn: gameState.turn + 1});
        };
        turnObject.buys = buysLeft;
        setVictoryPoints(newVictoryPoints);
        break;

      default:
        const setSpacer = gameState.turn === 1 && gameState.turnPlayer === 1? [] : spacer();
        turnObject.logs = turnObject.logs.concat(setSpacer.concat(printLog(gameState)));
        turnObject.buys =  1;
        if (hasType(hand, 'Action')) {
          turnObject.actions = 1;
          turnObject.phase = 'Action';
        } else {
          [turnObject.logs, turnObject.phase] = enterBuyPhase(gameState, turnObject.logs);
        }
        break;
    };
    setTurnState(turnObject);
  },
  setTurnState = turnObject => {
    setHand(turnObject.hand);
    setDeck(turnObject.deck);
    setDiscard(turnObject.discard);
    setTrash(turnObject.trash);
    setInPlay(turnObject.inPlay);
    setLogs(turnObject.logs);
    setSupply(turnObject.supply);
    setActions(turnObject.actions);
    setBuys(turnObject.buys);
    setTreasure(turnObject.treasure);
    setPhase(turnObject.phase);
    setMenuScreen(turnObject.menuScreen);
    setCoinMod(turnObject.coinMod);
  };

  window.onkeydown = e => {
    if (e.keyCode === 18) {
      setAltKey(true);
    } else if (e.keyCode === 27) {
      setShowModal(false);
    } else if (e.keyCode === 13) {
      if (menuScreen && gameState.turn === 0) startGame();
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
          coinMod={coinMod}
          restriction={discardTrashState? discardTrashState.restriction : undefined}
        />
      </div>
      <LogDisplay logs={logs} />
      <TurnInfo
        victoryPoints={victoryPoints}
        actions={actions}
        buys={buys}
        treasure={treasure}
        coinMod={coinMod}
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
