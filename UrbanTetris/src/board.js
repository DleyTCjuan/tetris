export const BLOCK_SIZE = 26
export const BOARD_WIDTH = 10
export const BOARD_HEIGHT = 22

export const EVENT_MOVEMENTS = {
    LEFT: 'ArrowLeft',
    RIGHT: 'ArrowRight',
    DOWN: 'ArrowDown',
}



export function createBoard(width, height) {
  return Array(height).fill().map(() => Array(width).fill(0));
}

export function removeRows(board, setScore) {
  const rowsToRemove = [];
  board.forEach((row, y) => {
    if (row.every(value => value === 1)) {
      rowsToRemove.push(y);
    }
  });

  rowsToRemove.forEach(y => {
    board.splice(y, 1);
    board.unshift(Array(board[0].length).fill(0));
    setScore(prev => prev + 1);
  });
}
