const fs = require('fs');

const dictionary = JSON.parse(fs.readFileSync('./dictionary.json', 'utf-8'));
const fiveLetterWords = dictionary.filter((word) => word.length === 5);

console.log('Five letter word count:', fiveLetterWords.length);

letterCounts = {};

let currentDictionary = fiveLetterWords;

currentDictionary.forEach((word) => {
  const unique = [ ...new Set(word.split(''))];
  unique.forEach((letter) => {
    letterCounts[letter] = letterCounts[letter] ? letterCounts[letter] + 1 : 1;
  });
});

// sum the values
const totalLetters = Object.values(letterCounts).reduce((a, b) => a + b, 0);

console.log(JSON.stringify(letterCounts, null, 2));
console.log('Total letters:', totalLetters);

// assign letter scores
const letterScores = {};

Object.keys(letterCounts).forEach((letter) => {
  letterScores[letter] = letterCounts[letter] / totalLetters;
});

console.log(JSON.stringify(letterScores, null, 2));

// assign word scores
const wordScores = [];

currentDictionary.forEach((word) => {
  const unique = [ ...new Set(word.split(''))];
  const score = unique.reduce((a, b) => a + letterScores[b], 0);
  wordScores.push([ word, score ]);
});

wordScores.sort(function(a, b) {
  return b[1] - a[1];
});

wordScores.slice(0, 10).forEach(word => {
  console.log(word[0], "\t", word[1].toFixed(4));
});


