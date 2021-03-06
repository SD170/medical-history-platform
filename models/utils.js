const randomAlphNumString = (len = 10, bits = 36) => {
  //   let bits = bits || 36;
  let outStr = "";
  let newStr;
  while (outStr.length < len) {
    newStr = Math.random().toString(bits).slice(2);
    outStr += newStr.slice(0, Math.min(newStr.length, len - outStr.length));
  }
  return outStr.toUpperCase();
};

module.exports = {
  randomAlphNumString,
};
