/*------------------------- version -------------------------*/
console.log('version 1.0');

/*------------------------- constants -------------------------*/
// Word list sourced from:
// https://github.com/dariusk/corpora/blob/master/data/words/common.json
// https://github.com/rsms/inter/blob/master/docs/lab/words-google-10000-english-usa-no-swears.json
// https://gist.github.com/BideoWego/60fbd40d5d1f0f1beca11ba95221dd38#file-dictionary-json

// Save the words with 7 unique letters into an array:
const WORDS_SEVEN_UNIQUE = [];
const LETTER_SETS = [];
for (const word in ALL_WORDS) {
  const uniqueLetters = new Set(word.split(""));
  // console.log('The set of letters is: ', uniqueLetters)
  if (uniqueLetters.size === 7) {
    WORDS_SEVEN_UNIQUE.push(word);
    LETTER_SETS.push(uniqueLetters);
  };
};


/*------------------------- state variables -------------------------*/
const state = {
  randomSet: null,
  keyLetter: null,
  otherLetters: null,
  validWords: null,
  correctGuesses: null,
  result: null,
  points: 0,
};


/*------------------------- cached elements  -------------------------*/
const elements = {
  message: document.getElementById('message-container'),
  points: document.getElementById('points-container'),
  correctWords: document.getElementById('correct-words-container'),
  // letterContainer: document.getElementById('letter-container'),
  letterContainer: document.getElementById('letter-container'),
  textInput: document.getElementById('current-guess'), // The input field
  backspaceButton: document.getElementById('backspace'), // The backspace button
  checkButton: document.getElementById('check-word'), // The check word button
  shuffleButton: document.getElementById('shuffle'), // The shuffle letters button
  playAgainButton: document.getElementById('play-again'), // The play again button
};


/*------------------------- event listeners -------------------------*/
elements.playAgainButton.addEventListener('click', init);
elements.letterContainer.addEventListener('click', handleClick);
elements.backspaceButton.addEventListener('click', handleBackspace);
elements.checkButton.addEventListener('click', handleCheckGuess);
elements.shuffleButton.addEventListener('click', shuffleLetters);
elements.textInput.addEventListener('keypress', handleKeypress);


/*------------------------- functions -------------------------*/
init();

function init () {
  state.randomSet = randomLetterSet();
  state.keyLetter = randomLetter();
  state.otherLetters = otherLetters();
  state.validWords = retrieveValidWords();
  state.correctGuesses = [];
  state.result = null;
  state.points = 0;
  
  elements.textInput.value = '';
  
  // Shuffle letters and render the game:
  shuffleLetters(); // Includes call to render();
}

function handleClick(event) {
  // If the event.target wasn't a letter, exit the function:
  if (event.target.classList.contains('letter') === false) return;

  // If the game has already finished, exit the function:
  if (state.result !== null) return;

  // Add the letter to the input field:
  elements.textInput.value += event.target.innerText;
}

function handleKeypress(event) {
  // If the keys are Shift+Enter, start a new game:
  if (event.key === 'Enter' && event.shiftKey === true) {
    init();
  }

  // If the game has already finished, exit the function:
  if (state.result !== null) return;

  // Check if the key pressed is the Enter key:
  if(event.key === 'Enter') {
    // Prevent the default method:
    event.preventDefault();
    // Invoke a click on the check word button:
    elements.checkButton.click();
  }
}

function handleBackspace() {
  const str = elements.textInput.value;
  // Exit the function if the input is already empty:
  if (str === '') return;
  // Remove the last letter from the input field:
  elements.textInput.value = str.substring(0, str.length - 1);
}

function handleCheckGuess(event) {
  // If the game has already finished, exit the function:
  if (state.result !== null) return;
  
  // Convert the typed guess to all lower case:
  const guess = elements.textInput.value.toLowerCase();
  console.log('The guess was: ', guess);
  
  // Check if the guessed word is a valid word and hasn't already been guessed:
  if (state.validWords.includes(guess) && !state.correctGuesses.includes(guess)) {
    // If the word is a valid word, push it the the correct guesses array:
    console.log('in the true branch');
    state.correctGuesses.push(guess);
    // Add points equal to the length of the word:
    state.points += guess.length;
  } else if (state.correctGuesses.includes(guess)) {
    // If the word has already been guessed:
    console.log('word already guessed!');
  } else {
    // If the word is NOT a valid word... :
    console.log('in the false branch');
  };
  
  // Empty out the input field:
  elements.textInput.value = '';

  // Check for winner:
  state.result = checkWinner();

  // Run render():
  render();
}

function randomLetterSet() {
  const index = Math.floor( Math.random() * LETTER_SETS.length );
  // Turn the set into an array for easier manipulation:
  const set = [...LETTER_SETS[index]];
  console.log('The random letter set is: ', set);
  return set;
}

function randomLetter() {
  const index = Math.floor( Math.random() * state.randomSet.length );
  const keyLetter = state.randomSet[index];
  console.log('The key letter is: ', keyLetter);
  return keyLetter;
}

function otherLetters() {
  const otherLetters = [];

  // Add the letters that aren't the keyLetter to the otherLetters array:
  for ( let i = 0; i < state.randomSet.length; i++ ) {
    if (state.randomSet[i] !== state.keyLetter ) {
      otherLetters.push(state.randomSet[i]);
    }
  }
  // state.randomSet.forEach(element => element !== state.keyLetter ? '' : element);
  console.log('The other letters are: ', otherLetters);
  return otherLetters;
}

function shuffleLetters() {
  state.otherLetters = state.otherLetters.sort(() => Math.random() - 0.5);
  render();
}

function retrieveValidWords() {
  const validWords = [];
  // Add the words that contain only the keyLetter and the otherLetters:
  for (let word in ALL_WORDS) {
    // Start by assuming that the word is valid:
    let valid = true;

    // Ignore words < 3 letter long:
    if (word.length < 3) {
      valid = false;
    }

    // If any letter in the word isn't in the set of letters, set 'valid' to false:
    for ( let i = 0; i < word.length; i++ ) {
      if ( !state.randomSet.includes(word[i]) ) {
        valid = false;
        break;
      }
    }

    // If the key letter isn't in the word, set 'valid' to false:
    if ( !word.includes(state.keyLetter) ) {
      valid = false;
    }

    // If the word passes the tests, add it to the list of valid words:
    if (valid === true) {
      validWords.push(word);
      console.log(word, ' is a valid word');
    };
  }

  console.log(ALL_WORDS.length, ' total words');
  console.log(validWords.length, ' valid words gathered.');
  return validWords;
}

function checkWinner() {
  // Check if all the valid words have been guessed:
  result = state.validWords.every(word => state.correctGuesses.includes(word));
  return result ? true : null;
}

function render() {
  renderAllLetters();
  renderAllWords();
  renderMessage();
  renderPoints();
}

function renderAllLetters() {
  // Render the regular letters into their divs:
  for (let i = 0; i < 6; i++) {
    document.getElementById(`letter-${i}`).innerHTML = state.otherLetters[i];
  }

  // Render the key letter into it's div:
  document.getElementById('letter-key').innerHTML = state.keyLetter;
}

function renderAllWords() {
  if ( state.correctGuesses.length === 0 ) {
    // If no correct guesses yet, leave a message with instructions:
    elements.correctWords.innerHTML = 'Guess a word to begin...';
  } else if ( state.correctGuesses.length === 1 ) {
    // If the first correct guess hasn't been added yet, delete the previous placeholder text and add it:
    const firstWord = state.correctGuesses[0];
    if (!document.getElementById(firstWord)) {
      elements.correctWords.innerHTML = '';
      elements.correctWords.prepend(renderOneWord(firstWord));
    }
  } else {
    // Otherwise, prepend the most recent guess to the list of guesses:
    const lastWord = state.correctGuesses[state.correctGuesses.length - 1];

    // If the last guessed word is already in the list, exit the function:
    if (document.getElementById(lastWord)) return;
    
    elements.correctWords.prepend(', ');
    elements.correctWords.prepend(renderOneWord(lastWord));
  }
}

function renderOneWord(word) {
  // Create a span for the last guessed word and return it:
  wordElement = document.createElement('span');
  wordElement.innerText = word;
  wordElement.setAttribute('id', word);

  return wordElement
}

function renderMessage() {
  // Clear out the previous message:
  elements.message.innerHTML = '';

  // Render the number of correctly guessed words and the total possible:
  const text = `${state.correctGuesses.length} / ${state.validWords.length} words`;
  messageElement = document.createElement('div');
  messageElement.innerText = text;
  elements.message.appendChild(messageElement);
}

function renderPoints() {
  // Clear out the previous message:
  elements.points.innerHTML = '';

  // Render the number of points:
  pointsElement = document.createElement('div');
  pointsElement.innerText = `${state.points} points`;
  elements.points.appendChild(pointsElement);
}

// Solver function (enters all valid words to fastforward to end of game):
function solve() {
  // Loop through the valid words, submit each one as a guess:
  for (const word of state.validWords) {
    elements.textInput.value = word;
    elements.checkButton.click();
  }
}
