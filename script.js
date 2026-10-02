const cells = [...document.querySelectorAll('.cell')];
const statusText = document.getElementById('status');
const turnSymbol = document.getElementById('turn-symbol');
const modeSelect = document.getElementById('mode');
const xScoreEl = document.getElementById('x-score');
const oScoreEl = document.getElementById('o-score');
const drawScoreEl = document.getElementById('draw-score');
const xScoreCard = document.getElementById('x-score-card');
const oScoreCard = document.getElementById('o-score-card');
const oLabel = document.getElementById('o-label');

const winningLines = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

let board = Array(9).fill('');
let currentPlayer = 'X';
let gameOver = false;
let scores = { X: 0, O: 0, draw: 0 };

function getWinningLine() {
  return winningLines.find(([a, b, c]) => board[a] && board[a] === board[b] && board[a] === board[c]);
}

function updateTurnUI() {
  xScoreCard.classList.toggle('active-score', !gameOver && currentPlayer === 'X');
  oScoreCard.classList.toggle('active-score', !gameOver && currentPlayer === 'O');
  if (gameOver) return;
  turnSymbol.textContent = currentPlayer;
  turnSymbol.style.color = currentPlayer === 'X' ? 'var(--x)' : 'var(--o)';
  statusText.textContent = modeSelect.value === 'computer' && currentPlayer === 'O'
    ? 'Computer is thinking…'
    : `Player ${currentPlayer}'s turn`;
}

function renderBoard() {
  cells.forEach((cell, index) => {
    cell.textContent = board[index];
    cell.classList.toggle('x', board[index] === 'X');
    cell.classList.toggle('o', board[index] === 'O');
    cell.classList.remove('winner');
    cell.disabled = gameOver || Boolean(board[index]) ||
      (modeSelect.value === 'computer' && currentPlayer === 'O');
    cell.setAttribute('aria-label', `Cell ${index + 1}${board[index] ? `, ${board[index]}` : ', empty'}`);
  });
  xScoreEl.textContent = scores.X;
  oScoreEl.textContent = scores.O;
  drawScoreEl.textContent = scores.draw;
  oLabel.textContent = modeSelect.value === 'computer' ? 'COMPUTER O' : 'PLAYER O';
  updateTurnUI();
}

function finishGame(winner) {
  gameOver = true;
  if (winner) {
    scores[winner] += 1;
    statusText.textContent = modeSelect.value === 'computer' && winner === 'O'
      ? 'Computer wins this round!'
      : `Player ${winner} wins!`;
    const line = getWinningLine();
    if (line) line.forEach(index => cells[index].classList.add('winner'));
  } else {
    scores.draw += 1;
    statusText.textContent = "It's a draw!";
  }
  turnSymbol.textContent = winner || '＝';
  renderBoard();
  if (winner) {
    const line = getWinningLine();
    if (line) line.forEach(index => cells[index].classList.add('winner'));
  }
}

function makeMove(index) {
  if (gameOver || board[index] || (modeSelect.value === 'computer' && currentPlayer === 'O')) return;
  board[index] = currentPlayer;
  const line = getWinningLine();
  if (line) { renderBoard(); finishGame(currentPlayer); return; }
  if (board.every(Boolean)) { renderBoard(); finishGame(null); return; }
  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  renderBoard();
  if (modeSelect.value === 'computer' && currentPlayer === 'O' && !gameOver) {
    window.setTimeout(computerMove, 420);
  }
}

function computerMove() {
  if (gameOver || modeSelect.value !== 'computer' || currentPlayer !== 'O') return;
  const move = chooseComputerMove();
  if (move !== -1) {
    board[move] = 'O';
    const line = getWinningLine();
    if (line) { renderBoard(); finishGame('O'); return; }
    if (board.every(Boolean)) { renderBoard(); finishGame(null); return; }
    currentPlayer = 'X';
    renderBoard();
  }
}

function chooseComputerMove() {
  // Win if possible, block the player if needed, then prefer center/corners.
  for (const mark of ['O', 'X']) {
    for (let i = 0; i < board.length; i++) {
      if (!board[i]) {
        board[i] = mark;
        const wins = Boolean(getWinningLine());
        board[i] = '';
        if (wins) return i;
      }
    }
  }
  if (!board[4]) return 4;
  const corners = [0, 2, 6, 8].filter(i => !board[i]);
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
  const sides = [1, 3, 5, 7].filter(i => !board[i]);
  return sides.length ? sides[Math.floor(Math.random() * sides.length)] : -1;
}

function newRound() {
  board = Array(9).fill('');
  currentPlayer = 'X';
  gameOver = false;
  renderBoard();
}

cells.forEach((cell, index) => cell.addEventListener('click', () => makeMove(index)));
document.getElementById('new-round').addEventListener('click', newRound);
document.getElementById('reset-score').addEventListener('click', () => {
  scores = { X: 0, O: 0, draw: 0 };
  newRound();
});
modeSelect.addEventListener('change', newRound);
renderBoard();
