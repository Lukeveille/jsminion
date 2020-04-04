export default arr => {
  const newArr = [...arr];
  let index = newArr.length, temp, random;
  while (0 !== index) {
    random = Math.floor(Math.random() * index);
    index -= 1;
    temp = newArr[index];
    newArr[index] = newArr[random];
    newArr[random] = temp;
  };
  return newArr;
};