import cardList from './cards.json';

const importAll = files => {
  return files.keys().map(files)
},
extract = data => {
  return file => {
    file.path = data.filter(name => name.includes(file.name))[0];
    return file;
  }
},
cardImages = importAll(require.context(`../media`)),
allCards = {
  victory: cardList.victory.map(extract(cardImages)),
  treasure: cardList.treasure.map(extract(cardImages)),
  action: cardList.action.map(extract(cardImages))
};

export default () => {
  const startingDeck = [];
  for (let j = 0; j < 3; j++) {
    for (let i = 0; i < 7; i++) {
      startingDeck.push(allCards.treasure[j]);
    };
  }
  for (let i = 0; i < 3; i++) {
    startingDeck.push(allCards.victory[0]);
  };
  for (let j = 0; j < 3; j++) {
    for (let i = 0; i < 3; i++) {
      startingDeck.push(allCards.action[j]);
    };
  }
  return startingDeck;
};
