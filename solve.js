const fs = require('fs');

let guessDictionary = JSON.parse(fs.readFileSync('./wordleDictionary.json', 'utf-8'));

// possible answers are only at the end of the array, after "zymic"
let answerDictionary = guessDictionary.slice(guessDictionary.indexOf('zymic') + 1);

// remove previous answers from answerDictionary
const previousAnswers = fs.readFileSync('./previousAnswers.csv', 'utf-8').split('\r\n');
previousAnswers.forEach((answer) => {
  const index = answerDictionary.indexOf(answer);
  if (index > -1) {
    answerDictionary.splice(index, 1);
  }
});

let anyMatch = [];
let greenMatch = [];

letterResult(0, 's', 'x');
letterResult(1, 'a', 'x');
letterResult(2, 'i', 'y');
letterResult(3, 'n', 'y');
letterResult(4, 'e', 'x');

// letterResult(0, 'd', 'x');
// // letterResult(1, 'e', 'y');
// letterResult(2, 't', 'x');
// letterResult(3, 'e', 'g');
// letterResult(4, 'r', 'g');

// letterResult(0, 'l', 'y');
// letterResult(1, 'o', 'x');
// letterResult(2, 'v', 'x');

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
      greenMatch.push(letter);
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

function guess(anyMatch, greenMatch) {
  console.log('Guess Dictionary Length:', guessDictionary.length);
  console.log('Answer Dictionary Length:', answerDictionary.length);
  console.log('matches:', anyMatch);
  console.log('green matches:', greenMatch);

  // for each word in the guess dictionary count the number of words that have matching letters in the answer dictionary
  const wordScores = [];
  guessDictionary.forEach((word) => {

    let unique = [ ...new Set(word.split(''))];

    unique = unique.filter(x => !anyMatch.includes(x));

    const matches = answerDictionary.filter((answer) => {
      return unique.reduce((a, b) => a || answer.includes(b), false);
    });

    wordScores.push([word, matches.length]);
  });

  // generate a score for green letters
  wordScores.forEach((wordScore) => {
    const word = wordScore[0];
    const letters = word.split('');
    let count = 0;
    answerDictionary.forEach((answer) => {
      let matched = 0;
      letters.forEach((letter, index) => {
        if (answer.split('')[index] === letter && !greenMatch.includes(letter)) {
          matched++;
        }
      });
      count += matched;
    });
    wordScore[2] = count;
  });

  // sort by gray score descending
  wordScores.sort((a, b) => {
    return ((b[1] - a[1]) * 2) + (b[2] - a[2]);
  });

  if (answerDictionary.length < 30) {
    wordScores.forEach(word => {
      if (answerDictionary.indexOf(word[0]) > -1) {
        console.log(word[0], word[1], word[2]);
      }
    });

    console.log('---------------------------');
  }

  wordScores.slice(0, 20).forEach(word => {
    possibleAnswer = answerDictionary.indexOf(word[0]) > -1 ? '*' : '';
    possibleAnswer = previousAnswers.indexOf(word[0]) > -1 ? '-' : possibleAnswer;
    console.log(word[0], word[1], word[2], possibleAnswer);
  });

}
