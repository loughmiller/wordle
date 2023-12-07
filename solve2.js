#!/usr/bin/env node

const fs = require('fs');

let guessDictionary = JSON.parse(fs.readFileSync('./wordleDictionary.json', 'utf-8'));

// possible answers are only at the end of the array, after "zymic"
let answerDictionary = guessDictionary.slice(guessDictionary.indexOf('zymic') + 1);

// load previous answers
const previousAnswers = fs.readFileSync('./previousAnswers.csv', 'utf-8').split('\n');
// log previous answers
// console.log('Previous Answers:', previousAnswers.join(', '));
// previousAnswers = [];

// remove previous answers from answerDictionary
previousAnswers.forEach((answer) => {
  const index = answerDictionary.indexOf(answer);
  if (index > -1) {
    answerDictionary.splice(index, 1);
  }
});


let anyMatch = [];
let greenMatch = {};


letterResult(0, 'c', 'x');
letterResult(1, 'l', 'x');
letterResult(2, 'o', 'x');
letterResult(3, 'u', 'x');
letterResult(4, 't', 'y');

letterResult(0, 'd', 'x');
letterResult(1, 'h', 'x');
letterResult(2, 'i', 'x');
letterResult(3, 'k', 'y');
letterResult(4, 'r', 'x');

letterResult(0, 's', 'x');
letterResult(1, 't', 'y');
letterResult(2, 'e', 'y');
letterResult(3, 'a', 'y');
letterResult(4, 'k', 'y');

// letterResult(0, 'w', 'x');
// letterResult(1, 'a', 'x');
// letterResult(2, 'x', 'x');
// letterResult(3, 'e', 'g');
// letterResult(4, 'n', 'g');

guess(anyMatch, greenMatch);

function letterResult(position, letter, color) {
  anyMatch.push(letter);
  switch (color) {
    case 'x':
      grayLetter(position, letter);
      return;
    case 'y':
      yellowLetter(position, letter);
      return;
    case 'g':
      greenLetter(position, letter);
      greenMatch[letter] = position;
      return;
    default:
      console.log('Invalid color');
      process.exit(1);
    }
}

function grayLetter(position, letter) {
  // guessDictionary = removeWordsWithLetter(guessDictionary, letter);
  answerDictionary = removeWordsWithLetter(answerDictionary, letter);
}

function yellowLetter(position, letter) {
  // const tempGuessDictionary = removeWordsWithoutLetter(guessDictionary, letter);
  // guessDictionary = removeWordsWithLetterAtPosition(tempGuessDictionary, letter, position);
  const tempAnswerDictionary = removeWordsWithoutLetter(answerDictionary, letter);
  answerDictionary = removeWordsWithLetterAtPosition(tempAnswerDictionary, letter, position);
}

function greenLetter(position, letter) {
  // guessDictionary = keepWordsWithLetterAtPosition(guessDictionary, letter, position);
  answerDictionary = keepWordsWithLetterAtPosition(answerDictionary, letter, position);
}

function guess(anyMatch, greenMatch) {
  console.log('Guess Dictionary Length:', guessDictionary.length);
  console.log('Answer Dictionary Length:', answerDictionary.length);
  console.log('matches:', anyMatch);
  console.log('green matches:', greenMatch);

  let wordScores = buildWordScores(answerDictionary, greenMatch);

  // pretty print the answer dictionary
  // console.log(JSON.stringify(answerDictionary, null, 2));

  if (answerDictionary.length < 50) {
    wordScores.forEach(word => {
      if (answerDictionary.indexOf(word[0]) > -1) {
        console.log(word[0], word[1]);
      }
    });

    console.log('---------------------------');
  }

  console.log(wordScores.length);

  wordScores.slice(0, 40).forEach(word => {
    possibleAnswer = answerDictionary.indexOf(word[0]) > -1 ? '*' : '';
    possibleAnswer = previousAnswers.indexOf(word[0]) > -1 ? '-' : possibleAnswer;
    console.log(word[0], word[1], possibleAnswer);
  });
}

function buildWordScores(dictionary, greenMatch) {

  console.log(dictionary);

  // YELLOW LETTER SCORES FOR EACH LETTER
  // for each letter in the alphabet, call yellowLetterCount for
  // positions 0 - 4 and store the results in an array
  const yellowLetterCounts = [];
  for (let i = 0; i < 5; i++) {
    yellowLetterCounts.push([]);
    for (let j = 0; j < 26; j++) {
      yellowLetterCounts[i].push(yellowLetterCount(dictionary, i, String.fromCharCode(97 + j)));
    }
  }

  // pretty printy yellowLetterCounts
  // console.log(JSON.stringify(yellowLetterCounts, null, 2));

  // GREEN LETTER SCORES FOR EACH LETTER
  // for each letter in the alphabet, call greenLetterCount for
  // positions 0 - 4 and store the results in an array
  const greenLetterCounts = [];
  for (let i = 0; i < 5; i++) {
    greenLetterCounts.push([]);
    for (let j = 0; j < 26; j++) {
      // use zero for green letters that have already been matched
      if (greenMatch[String.fromCharCode(97 + j)] === i) {
        greenLetterCounts[i].push(0);
      } else {
        let glc = greenLetterCount(dictionary, i, String.fromCharCode(97 + j));
        // if a letter matches all words in the dictionary, ignore it
        if (glc === dictionary.length) {
          greenLetterCounts[i].push(0);
        } else {
          greenLetterCounts[i].push(glc);
        }
      }
    }
  }

  // YELLOW LETTER WORD SCORES
  // for each work in the guess dictionary create a score for each letter
  // based on the yellowLetterCounts store the results in an object
  const wordScores = {};
  guessDictionary.forEach((word) => {
    let scores = [];
    for (let i = 0; i < 5; i++) {
      scores.push(yellowLetterCounts[i][word.charCodeAt(i) - 97]);
    }
    wordScores[word] = scores;
  });

  // GREEN LETTER WORD SCORES
  // for each work in the guess dictionary create a score for each letter
  // based on the greenLetterCounts store the results in an object
  guessDictionary.forEach((word) => {
    for (let i = 0; i < 5; i++) {
      wordScores[word].push(greenLetterCounts[i][word.charCodeAt(i) - 97]);
    }
  });

  // GRAY LETTERS
  // for each word in the guess dictionary get each letter, then call remove words
  // with letter on the answer dictionary, then count remaining words
  guessDictionary.forEach((word) => {
    let tempAnswerDictionary = dictionary;
    for (let i = 0; i < 5; i++) {
      const letter = word.split('')[i];

      // only count if this letter isn't in the greenMatch list
      if (greenMatch[letter] !== i) {
        // corner case, if the letter matches all words in the dictionary
        // don't remove everything
        tempTempAnswerDictionary = removeWordsWithLetter(tempAnswerDictionary, letter);
        if (tempTempAnswerDictionary.length !== 0) {
          tempAnswerDictionary = tempTempAnswerDictionary;
        }
      }
    }

    wordScores[word].push(tempAnswerDictionary.length);
  });

  // for each wordScore, find the max score and store it in an array with the word
  const wordScoresArray = [];
  Object.entries(wordScores).forEach((wordScore) => {
    const word = wordScore[0];
    const scores = wordScore[1];
    const maxScore = Math.max(...scores);
    wordScoresArray.push([word, maxScore, scores]);
  });

  // sort the wordScoresArray by maxScore acending
  wordScoresArray.sort((a, b) => a[1] - b[1]);

  // pretty print the wordScores object
  // console.log(JSON.stringify(wordScores, null, 2));
  // console.log(JSON.stringify(wordScoresArray, null, 2));

  return wordScoresArray;
}


function yellowLetterCount(dictionary, position, letter) {
  let tempAnswerDictionary = removeWordsWithoutLetter(dictionary, letter);
  tempAnswerDictionary = removeWordsWithLetterAtPosition(tempAnswerDictionary, letter, position);
  return tempAnswerDictionary.length;
}

function greenLetterCount(dictionary, position, letter) {
  let tempAnswerDictionary = keepWordsWithLetterAtPosition(dictionary, letter, position);
  return tempAnswerDictionary.length;
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

