const fs = require('fs');

const dictionary = JSON.parse(fs.readFileSync('./dictionary.json', 'utf-8'));
const fiveLetterWords = dictionary.filter((word) => word.length === 5);

console.log('Five letter word count:', fiveLetterWords.length);

letterCounts = {};

let currentDictionary = fiveLetterWords;

currentDictionary = grayLetter(currentDictionary, 0, 'a');
currentDictionary = grayLetter(currentDictionary, 1, 'r');
currentDictionary = grayLetter(currentDictionary, 2, 'o');
currentDictionary = grayLetter(currentDictionary, 3, 's');
currentDictionary = grayLetter(currentDictionary, 4, 'e');

currentDictionary = grayLetter(currentDictionary, 0, 'u');
currentDictionary = yellowLetter(currentDictionary, 1, 'n');
currentDictionary = yellowLetter(currentDictionary, 2, 'i');
currentDictionary = grayLetter(currentDictionary, 3, 't');
currentDictionary = greenLetter(currentDictionary, 4, 'y');

// currentDictionary = yellowLetter(currentDictionary, 0, 'd');
// currentDictionary = greenLetter(currentDictionary, 1, 'i');
// currentDictionary = greenLetter(currentDictionary, 2, 'n');
// currentDictionary = grayLetter(currentDictionary, 3, 'g');
// currentDictionary = greenLetter(currentDictionary, 4, 'y');

guess(currentDictionary);

function grayLetter(currentDictionary, position, letter) {
  return removeWordsWithLetter(currentDictionary, letter);
}

function yellowLetter(currentDictionary, position, letter) {
  const tempDictionary = removeWordsWithoutLetter(currentDictionary, letter);
  return removeWordsWithLetterAtPosition(tempDictionary, letter, position);
}

function greenLetter(currentDictionary, position, letter) {
  return keepWordsWithLetterAtPosition(currentDictionary, letter, position);
}

function removeWordsWithLetter(dictionary, letter) {
  return dictionary.filter((word) => !word.includes(letter));
}

function removeWordsWithoutLetter(dictionary, letter) {
  return dictionary.filter((word) => word.includes(letter));
}

function removeWordsWithLetterAtPosition(dictionary, letter, position) {
  return dictionary.filter((word) => word.split('')[position] !== letter);
}

function keepWordsWithLetterAtPosition(dictionary, letter, position) {
  return dictionary.filter((word) => word.split('')[position] === letter);
}

function guess(dictionary) {
  dictionary.forEach((word) => {
    const unique = [ ...new Set(word.split(''))];
    unique.forEach((letter) => {
      letterCounts[letter] = letterCounts[letter] ? letterCounts[letter] + 1 : 1;
    });
  });

  // sum the values
  const totalLetters = Object.values(letterCounts).reduce((a, b) => a + b, 0);

  // console.log(JSON.stringify(letterCounts, null, 2));
  // console.log('Total letters:', totalLetters);

  // assign letter scores
  const letterScores = {};

  Object.keys(letterCounts).forEach((letter) => {
    letterScores[letter] = letterCounts[letter] / totalLetters;
  });

  // convert opbect to array
  let letterScoresArray = Object.entries(letterScores).map(([letter, score]) => {
    return [ letter, (score * 100).toFixed(1) ];
  });

  // sort by count
  letterScoresArray.sort(function(a, b) {
    return b[1] - a[1];
  });

  letterScoresArray.forEach((letter) => {
    console.log(letter);
  });

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

  wordScores.slice(0, 20).forEach(word => {
    console.log(word[0], "\t", word[1].toFixed(4));
  });
}



