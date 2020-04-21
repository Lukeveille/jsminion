import cardList from './cards.json';

export const standardGame = [
  'Village',
  'Smithy',
  'Market',
  'Chapel', // trash
  'Cellar', // discard
  'Remodel', // trash
  'Mine', // trash
  'Moneylender', // trash
  'Vassal', // discard *modal option
  // 'Workshop',
  // 'Harbinger',
  // 'Merchant',
  // 'Festival',
  // 'Laboratory'
];

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
cardTypes = ['treasure', 'victory'],
allCards = (set = []) => ({
  victory: cardList.victory.map(extract(cardImages)),
  treasure: cardList.treasure.map(extract(cardImages)),
  action: cardList.action.map(extract(cardImages)).filter(card => ( set.includes(card.name) ))
});

export const startingCards = () => {
  const startingDeck = [];
  cardTypes.forEach(type => {
    for (let j = 0; j < (type === 'treasure'? 5 : 1); j++) {
      startingDeck.push(allCards()[type][1]);
    };
  });
  return startingDeck;
};

export const supplies = (set = []) => {
  const allCardTypes = cardTypes.concat('action'),
  allSupplies = [],
  setSupplies = type => {
    allCards(set)[type].forEach((cardType, i) => {
      const equation = type === 'treasure'? 20 * (3-i) : type === 'action' || cardType.name === 'Curse'? 10 : 8;
      for (let j = 0; j < equation; j++) {
        allSupplies.push(cardType);
      };
    });
  };

  allCardTypes.forEach(setSupplies);

  return allSupplies;
};
