/*------------------------- constants -------------------------*/
// Save the words with 7 unique letters from the wordlist to an array:
const WORDS_SEVEN_UNIQUE = [];
const LETTER_SETS = [];
for (const word in ALL_WORDS) {
  const uniqueLetters = new Set(word.split(""));
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
document.body.addEventListener('keypress', handleKeypress);


/*------------------------- functions -------------------------*/
init();

function init () {
  state.randomSet = getRandomLetterSet();
  state.keyLetter = getKeyLetter();
  state.otherLetters = getOtherLetters();
  state.validWords = getValidWords();
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

  // If the text input field is empty, exit the function:
  if (elements.textInput.value === '') return;

  // Convert the typed guess to all lower case:
  const guess = elements.textInput.value.toLowerCase();
  
  // Check if the guessed word is a valid word and hasn't already been guessed:
  if (state.validWords.includes(guess) && !state.correctGuesses.includes(guess)) {
    // If the word is a valid word, push it the the correct guesses array:
    state.correctGuesses.push(guess);
    // Add points equal to the length of the word:
    state.points += guess.length;
  } else if (state.correctGuesses.includes(guess)) {
    // If the word has already been guessed:
    animateDuplicateWord(guess);
  } else {
    // If the word is NOT a valid word... :
    animateIncorrectWord();
  };
  
  // Empty out the input field:
  elements.textInput.value = '';

  // Check for winner:
  state.result = checkWinner();
  if (state.result) animateWinGame();

  // Run render():
  render();
}

function getRandomLetterSet() {
  const index = Math.floor( Math.random() * LETTER_SETS.length );
  // Turn the set into an array for easier manipulation:
  const set = [...LETTER_SETS[index]];
  return set;
}

function getKeyLetter() {
  const index = Math.floor( Math.random() * state.randomSet.length );
  const keyLetter = state.randomSet[index];
  return keyLetter;
}

function getOtherLetters() {
  return [...state.randomSet].filter(letter => letter !== state.keyLetter);
}

function shuffleLetters() {
  state.otherLetters = state.otherLetters.sort(() => Math.random() - 0.5);
  render();
}

function getValidWords() {
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
    };
  }

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
      animateCorrectWord(firstWord);
    }
  } else {
    // Otherwise, prepend the most recent guess to the list of guesses:
    const lastWord = state.correctGuesses[state.correctGuesses.length - 1];

    // If the last guessed word is already in the list, exit the function:
    if (document.getElementById(lastWord)) return;
    
    elements.correctWords.prepend(', ');
    elements.correctWords.prepend(renderOneWord(lastWord));
    animateCorrectWord(lastWord);
  }
}

function renderOneWord(word) {
  // Create a span for the last guessed word and return it:
  wordElement = document.createElement('span');
  wordElement.innerText = word;
  wordElement.setAttribute('id', word);

  return wordElement;
}

function renderMessage() {
  // Render the number of correctly guessed words and the total possible:
  const text = `${state.correctGuesses.length} / ${state.validWords.length} words`;
  elements.message.innerText = text;

  // Colour the div 'gold' if all the words have been found:
  if (state.correctGuesses.length === state.validWords.length) {
    elements.message.classList.remove('bg-zinc-700');
    elements.message.classList.add('bg-yellow-500', 'animate-pulse', 'text-zinc-900');
  } else {
    elements.message.classList.remove('bg-yellow-500', 'animate-pulse', 'text-zinc-900');
    elements.message.classList.add('bg-zinc-700');
  }
}

function renderPoints() {
  // Clear out the previous message:
  elements.points.innerHTML = '';

  // Render the number of points:
  pointsElement = document.createElement('div');
  pointsElement.innerText = `${state.points} points`;
  elements.points.appendChild(pointsElement);
}

function animateCorrectWord(word) {
  wordEl = document.getElementById(word);
  // Add the 'correct' animation (lime background):
  wordEl.classList.add('animate-correct');
  // Remove the animation class once finished:
  setTimeout(() => {
    wordEl.classList.remove('animate-correct');
  }, 1750);
}

function animateDuplicateWord(word) {
  wordEl = document.getElementById(word);
  // Add the 'correct' animation (flash yellow background):
  wordEl.classList.add('animate-duplicate');
  // Remove the animation class once finished:
  setTimeout(() => {
      wordEl.classList.remove('animate-duplicate');
  }, 1500);
}

function animateIncorrectWord() {
  // Add the shaking animation:
  elements.textInput.classList.add('animate-shakeX');
  setTimeout(() => {
    elements.textInput.classList.remove('animate-shakeX');
  }, 750);
}

function animateWinGame() {
  const translations = [
    {id: 'letter-0', trans: ['-translate-4']},
    {id: 'letter-1', trans: ['translate-x-4', '-translate-y-4']},
    {id: 'letter-3', trans: ['translate-x-4']},
    {id: 'letter-5', trans: ['translate-4']},
    {id: 'letter-4', trans: ['-translate-x-4', 'translate-y-4']},
    {id: 'letter-2', trans: ['-translate-x-4']},
  ];

  const interval = 100; // Interval between animations of the regular letters.
  const duration = 200; // Duration of the animations of the regular letters.
  const totalTime = interval * 5 + duration; // Total time for all regular letter animations.
  const duration2 = 450; // Duration of the animation of the the key letter.
  
  // Pop-out the regular letters one-by-one clockwise:
  for (let i = 0; i < 6; i++) {
    setTimeout(() => {
      document.getElementById(translations[i].id).classList.add(...translations[i].trans);
    }, interval * i);
    setTimeout(() => {
      document.getElementById(translations[i].id).classList.remove(...translations[i].trans);
    }, interval * i + duration);
  }
  
  // Enlarge and ping the key letter:
  setTimeout(() => {
    document.getElementById('letter-key').classList.add('scale-175', 'animate-wiggle');
  }, totalTime );
  setTimeout(() => {
    document.getElementById('letter-key').classList.remove('scale-175', 'animate-wiggle');
  }, totalTime + duration2 );
}

// Solver function (enters all valid words to fastforward to end of game):
function solve() {
  // Loop through the valid words, submit each one as a guess:
  for (const word of state.validWords) {
    elements.textInput.value = word;
    elements.checkButton.click();
  }
}
