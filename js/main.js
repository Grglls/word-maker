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
for (let word in ALL_WORDS) {
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
  // diagramContainer: document.getElementById('diagram-container'),
  message: document.getElementById('message-container'),
  points: document.getElementById('points-container'),
  correctWords: document.getElementById('correct-words-container'),
  letterContainer: document.getElementById('letter-container'),
  textInput: document.getElementById('current-guess'), // The input field
  checkWord: document.getElementById('check-word'), // The check word button
  playAgain: document.getElementById('play-again'), // The play again button
};


/*------------------------- event listeners -------------------------*/
elements.playAgain.addEventListener('click', init);
elements.letterContainer.addEventListener('click', handleClick);
elements.checkWord.addEventListener('click', handleCheckGuess);
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
  
  render();
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
    elements.checkWord.click();
  }
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

function retrieveValidWords() {
  const validWords = [];
  // Add the words that contain only the keyLetter and the otherLetters:
  for (let word in ALL_WORDS) {
    // Start by assuming that the word is valid:
    let valid = true;

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
  renderLetters();
  renderWords();
  renderMessage();
  renderPoints();
}

function renderLetters() {
  // Render the letters from the set of letters:
  // First retrieve the three rows on letters:
  const keyboardRows = elements.letterContainer.children;

  // Clear out the current letters:
  for (let i = 0; i < 3; i++) {
    keyboardRows[i].innerHTML = '';
  }

  // Render 2 letters to the first row:
  for (let i = 0; i < 2; i++) {
    letterElement = document.createElement('div');
    letterElement.innerText = state.otherLetters[i];
    letterElement.classList.add('letter', 'p-3', 'bg-white', 'shadow', 'rounded-lg', 'cursor-pointer');
    keyboardRows[0].appendChild(letterElement);
  }

  // Render 3 letters to the middle row, with the key letter in the middle:
  for (let i = 0; i < 3; i++) {
    if (i === 1) {
      letterElement = document.createElement('div');
      letterElement.innerText = state.keyLetter;
      letterElement.classList.add('letter', 'p-3', 'bg-lime-500', 'shadow', 'rounded-lg', 'cursor-pointer');
      keyboardRows[1].appendChild(letterElement);
    } else if (i === 0) {
      letterElement = document.createElement('div');
      letterElement.innerText = state.otherLetters[i + 2];
      letterElement.classList.add('letter', 'p-3', 'bg-white', 'shadow', 'rounded-lg', 'cursor-pointer');
      keyboardRows[1].appendChild(letterElement);
    } else {
      letterElement = document.createElement('div');
      letterElement.innerText = state.otherLetters[i + 1];
      letterElement.classList.add('letter', 'p-3', 'bg-white', 'shadow', 'rounded-lg', 'cursor-pointer');
      keyboardRows[1].appendChild(letterElement);
    }
  }

  // Render 2 letters to the last row:
  for (let i = 4; i < state.otherLetters.length; i++) {
    letterElement = document.createElement('div');
    letterElement.innerText = state.otherLetters[i];
    letterElement.classList.add('letter', 'p-3', 'bg-white', 'shadow', 'rounded-lg', 'cursor-pointer');
    keyboardRows[2].appendChild(letterElement);
  }
}

function renderWords() {
  // Clear out the current wordContainer:
  elements.correctWords.innerHTML = '';

  if ( state.correctGuesses.length === 0 ) {
    wordElement = document.createElement('div');
    wordElement.innerText = 'Guess a word to begin...';
    // Append the words to the wordContainer:
    elements.correctWords.appendChild(wordElement);
  } else {
    tableElement = document.createElement('table');
    tableElement.classList.add('table-auto', 'border-collapse', 'border', 'border-zinc-500');
    for (let word of state.correctGuesses) {
      // Create the table row element:
      tableRowElement = document.createElement('tr');
      // Create the word and append to the table row:
      wordElement = document.createElement('td');
      wordElement.classList.add('border-collapse', 'border', 'border-zinc-500', 'p-2');
      wordElement.innerText = word;
      tableRowElement.appendChild(wordElement)
      // Create the definition and append to the table row:
      definitionElement = document.createElement('td');
      definitionElement.classList.add('border-collapse', 'border', 'border-zinc-500', 'p-2');
      definitionElement.innerText = ALL_WORDS[word];
      // definitionElement.classList.add('w:auto');
      tableRowElement.appendChild(definitionElement);
      // Append the row to the table (prepend to get newest guesses at top):
      tableElement.prepend(tableRowElement);
    }
    // Append the table to the wordContainer:
    elements.correctWords.appendChild(tableElement);
  }
}

function renderMessage() {
  // Clear out the previous message:
  elements.message.innerHTML = '';

  // Render the number of correctly guessed words and the total possible:
  const text = `${state.correctGuesses.length} out of ${state.validWords.length} words`;
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
  for (word of state.validWords) {
    elements.textInput.value = word;
    elements.checkWord.click();
  }
}
