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

export const startingCards =  () => {
  const startingDeck = [];
  for (let j = 0; j < 7; j++) {
    startingDeck.push(allCards.treasure[0]);
  };
  for (let i = 0; i < 3; i++) {
    startingDeck.push(allCards.victory[0]);
  };
  return startingDeck;
};

export const supplies =  () => {
  const allSupplies = [];
  for (let j = 0; j < allCards.treasure.length; j++) {
    for (let i = 0; i < 20 * (3-j); i++) {
      allSupplies.push(allCards.treasure[j]);
    };
  };
  for (let j = 0; j < allCards.victory.length; j++) {
    for (let i = 0; i < (j === 3? 10 : 8); i++) {
      allSupplies.push(allCards.victory[j]);
    };
  };
  for (let j = 0; j < allCards.action.length; j++) {
    for (let i = 0; i < 10; i++) {
      allSupplies.push(allCards.action[j]);
    };
  };
  return allSupplies;
}