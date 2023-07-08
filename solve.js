const fs = require('fs');

const dictionary = JSON.parse(fs.readFileSync('./wordleDictionary.json', 'utf-8'));
// const fiveLetterWords = dictionary.filter((word) => word.length === 5);

const previousAnswers = fs.readFileSync('./previousAnswers.csv', 'utf-8').split('\r\n');

// possible answers are only at the end of the array, after "zymic"
const answerStart = dictionary.indexOf('zymic');
const answerDictionary = dictionary.slice(answerStart + 1);

// remove previous answers from dictionary
previousAnswers.forEach((answer) => {
  const index = answerDictionary.indexOf(answer);
  if (index > -1) {
    answerDictionary.splice(index, 1);
  }
});

console.log('Dictionary Length:', dictionary.length);
console.log('Answer Dictionary Length:', answerDictionary.length);

letterCounts = {};

let currentDictionary = dictionary;

currentDictionary = letterResult(currentDictionary, 0, 's', 'x');
currentDictionary = letterResult(currentDictionary, 1, 'a', 'x');
currentDictionary = letterResult(currentDictionary, 2, 'i', 'x');
currentDictionary = letterResult(currentDictionary, 3, 'n', 'x');
currentDictionary = letterResult(currentDictionary, 4, 'e', 'y');

// currentDictionary = letterResult(currentDictionary, 0, 'g', 'x');
// currentDictionary = letterResult(currentDictionary, 1, 'r', 'y');
// currentDictionary = letterResult(currentDictionary, 2, 'e', 'y');
// currentDictionary = letterResult(currentDictionary, 3, 'a', 'x');
// currentDictionary = letterResult(currentDictionary, 4, 't', 'x');

guess(currentDictionary);

function letterResult(currentDictionary, position, letter, color) {
  switch (color) {
    case 'x':
      return grayLetter(currentDictionary, position, letter);
    case 'y':
      return yellowLetter(currentDictionary, position, letter);
    case 'g':
      return greenLetter(currentDictionary, position, letter);
  }
}

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

  // determine letter frequency in the answer dictionary
// ANSWER DICTIONARY NEEDS UPDATED TO REMOVE IMPOSSIBLE ANSWERS
  answerDictionary.forEach((word) => {
    const unique = [ ...new Set(word.split(''))];
    unique.forEach((letter) => {
      letterCounts[letter] = letterCounts[letter] ? letterCounts[letter] + 1 : 1;
    });
  });

  // sum the values
  const totalLetters = Object.values(letterCounts).reduce((a, b) => a + b, 0);

  // assign letter scores
  const letterScores = {};

  Object.keys(letterCounts).forEach((letter) => {
    letterScores[letter] = letterCounts[letter] / totalLetters;
  });

  ////////////////////////////////////////////////////////////////////////
  // display letter scores
  ////////////////////////////////////////////////////////////////////////
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

  ////////////////////////////////////////////////////////////////////////
  // assign word scores
  ////////////////////////////////////////////////////////////////////////
  const wordScores = [];

  // start with the % chance of each letter being in other words
  dictionary.forEach((word) => {
    const unique = [ ...new Set(word.split(''))];
    const score = unique.reduce((a, b) => a + letterScores[b], 0);
    wordScores.push([ word, score ]);
  });

  // add the % chance of each letter being in each position
  wordScores.forEach((wordScore) => {
    const word = wordScore[0];
    const letters = word.split('');
    let count = 0;
    // console.log(word);
    letters.forEach((letter, index) => {
      let matches = answerDictionary.filter((word) => word.split('')[index] === letter);
      count += matches.length;
      // console.log(matches.length);
      // console.log(letter, count);
    });
    wordScore[2] = count/answerDictionary.length;
    wordScore[3] = wordScore[2] + wordScore[1];
  });

  // sort by score
  wordScores.sort(function(a, b) {
    return b[3] - a[3];
  });

  wordScores.slice(0, 40).forEach(word => {
    possibleAnswer = answerDictionary.indexOf(word[0]) > -1 ? '*' : '';
    possibleAnswer = previousAnswers.indexOf(word[0]) > -1 ? '-' : possibleAnswer;
    console.log(word[0], "\t", word[1].toFixed(4), word[2].toFixed(4), word[3].toFixed(4), possibleAnswer);
  });
}



