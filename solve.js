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

let lettersGuessed = [];

console.log('Guess Dictionary Length:', guessDictionary.length);
console.log('Answer Dictionary Length:', answerDictionary.length);

// letterResult(0, 'a', 'x');
// letterResult(1, 'u', 'x');
// letterResult(2, 'r', 'g');
// letterResult(3, 'e', 'x');
// letterResult(4, 'i', 'x');

guess(lettersGuessed);

function letterResult(position, letter, color) {
  lettersGuessed.push(letter);
  switch (color) {
    case 'x':
      grayLetter(position, letter);
      return;
    case 'y':
      yellowLetter(position, letter);
      return;
    case 'g':
      greenLetter(position, letter);
      return;
    default:
      console.log('Invalid color');
      process.exit(1);
    }
}

function grayLetter(position, letter) {
  guessDictionary = removeWordsWithLetter(guessDictionary, letter);
  answerDictionary = removeWordsWithLetter(answerDictionary, letter);
}

function yellowLetter(position, letter) {
  const tempGuessDictionary = removeWordsWithoutLetter(guessDictionary, letter);
  guessDictionary = removeWordsWithLetterAtPosition(tempGuessDictionary, letter, position);
}

function greenLetter(position, letter) {
  guessDictionary = keepWordsWithLetterAtPosition(guessDictionary, letter, position);
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

function guess(matchedLetters) {
  // for each word in the guess dictionary count the number of words that have matching letters in the answer dictionary
  const wordScores = [];
  guessDictionary.forEach((word) => {

    let unique = [ ...new Set(word.split(''))];

    unique = unique.filter(x => !matchedLetters.includes(x));

    const matches = answerDictionary.filter((answer) => {
      return unique.reduce((a, b) => a || answer.includes(b), false);
    });

    wordScores.push([word, matches.length]);
  });

  // sort by score descending
  wordScores.sort((a, b) => b[1] - a[1]);

  wordScores.slice(0, 80).forEach(word => {
    possibleAnswer = answerDictionary.indexOf(word[0]) > -1 ? '*' : '';
    possibleAnswer = previousAnswers.indexOf(word[0]) > -1 ? '-' : possibleAnswer;
    console.log(word[0], "\t", word[1], possibleAnswer);
  });
}

// function guess() {

//   const letterCounts = {};

//   // determine letter frequency in the answer dictionary
//   answerDictionary.forEach((word) => {
//     const unique = [ ...new Set(word.split(''))];
//     unique.forEach((letter) => {
//       letterCounts[letter] = letterCounts[letter] ? letterCounts[letter] + 1 : 1;
//     });
//   });

//   // sum the values
//   const totalLetters = Object.values(letterCounts).reduce((a, b) => a + b, 0);

//   // assign letter scores
//   const letterScores = {};

//   Object.keys(letterCounts).forEach((letter) => {
//     letterScores[letter] = letterCounts[letter];
//   });

//   ////////////////////////////////////////////////////////////////////////
//   // display letter scores
//   ////////////////////////////////////////////////////////////////////////
//   // convert opbect to array
//   let letterScoresArray = Object.entries(letterScores).map(([letter, score]) => {
//     return [ letter, score ];
//   });

//   // sort by count
//   letterScoresArray.sort(function(a, b) {
//     return b[1] - a[1];
//   });

//   letterScoresArray.forEach((letter) => {
//     console.log(letter);
//   });

//   ////////////////////////////////////////////////////////////////////////
//   // assign word scores
//   ////////////////////////////////////////////////////////////////////////
//   const wordScores = [];

//   // start with a point for each word each letter matches
//   guessDictionary.forEach((word) => {
//     const unique = [ ...new Set(word.split(''))];
//     const score = unique.reduce((a, b) => a + letterScores[b], 0);
//     wordScores.push([ word, score ]);
//   });

//   // // add the % chance of each letter being in each position
//   // wordScores.forEach((wordScore) => {
//   //   const word = wordScore[0];
//   //   const letters = word.split('');
//   //   let count = 0;
//   //   // console.log(word);
//   //   letters.forEach((letter, index) => {
//   //     let matches = answerDictionary.filter((word) => word.split('')[index] === letter);
//   //     count += matches.length;
//   //     // console.log(matches.length);
//   //     // console.log(letter, count);
//   //   });
//   //   wordScore[2] = count/answerDictionary.length;
//   //   wordScore[3] = wordScore[2] + wordScore[1];
//   // });

//   // sort by score descending
//   wordScores.sort(function(a, b) {
//     return b[1] - a[1];
//   });

//   wordScores.slice(0, 40).forEach(word => {
//     possibleAnswer = answerDictionary.indexOf(word[0]) > -1 ? '*' : '';
//     possibleAnswer = previousAnswers.indexOf(word[0]) > -1 ? '-' : possibleAnswer;
//     console.log(word[0], "\t", word[1], possibleAnswer);
//   });
// }



