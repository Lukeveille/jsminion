export default type => {
  return (a, b) => {
    let compare = 0;
    if (a[type] > b[type]) {
      compare = 1;
    } else if (a[type] < b[type]) {
      compare = -1;
    };
    return compare;
  };
};
