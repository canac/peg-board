'use strict';

const Immutable = require('immutable');

const Position = new Immutable.Record({ row: null, column: null }, 'Position');
const Jump = new Immutable.Record({ start: null, middle: null, end: null }, 'Jump');
const State = new Immutable.Record({ board: null, jumps: null }, 'State');

const numRows = 5;

// Calculate the row and column of each hole
const positions = Immutable.Map().withMutations(positions => {
  let hole = 0;
  for (let row = 0; row < numRows; ++row) {
    for (let column = 0; column < row + 1; ++column) {
      positions.set(hole, new Position({ row, column }));
      ++hole;
    }
  }
});

// Calculate all possible jumps
const jumps = Immutable.List().withMutations(jumps => {
  positions.forEach((position, hole) => {
    const row = position.row;
    const column = position.column;

    // Jump to the left
    if (column > 1) {
      jumps.push(new Jump({
        start: hole,
        middle: hole - 1,
        end: hole - 2,
      }));
    }

    // Jump to the right
    if (column < row - 1) {
      jumps.push(new Jump({
        start: hole,
        middle: hole + 1,
        end: hole + 2,
      }));
    }

    if (row < numRows - 2) {
      // Jump down and to the left
      jumps.push(new Jump({
        start: hole,
        middle: hole + row + 1,
        end: hole + row * 2 + 3,
      }));

      // Jump down and to the right
      jumps.push(new Jump({
        start: hole,
        middle: hole + row + 2,
        end: hole + row * 2 + 5,
      }));
    }

    if (row > 1) {
      if (column > 1) {
        // Jump up and to the left
        jumps.push(new Jump({
          start: hole,
          middle: hole - row - 1,
          end: hole - row * 2 - 1,
        }));
      }

      if (column < row - 1) {
        // Jump up and to the right
        jumps.push(new Jump({
          start: hole,
          middle: hole - row,
          end: hole - row * 2 + 1,
        }));
      }
    }
  });
});

// Create the initial completely-full board
const fullBoard = Immutable.Set().withMutations(fullBoard => {
  for (let hole = 0; hole < 15; ++hole) {
    fullBoard.add(hole);
  }
});

// Create all possible initial states
let states = Immutable.Stack().withMutations(states => {
  for (let hole = 0; hole < 15; ++hole) {
    states.push(new State({
      board: fullBoard.remove(hole),
      jumps: Immutable.List(),
    }));
  }
});

let encounteredBoards = Immutable.Set();
let solutions = Immutable.List();

while (!states.isEmpty()) {
  const state = states.peek();
  states = states.pop();

  const board = state.board;

  if (encounteredBoards.has(board)) {
    // Ignore already encountered boards
    continue;
  }

  // Mark the board as previously encountered
  encounteredBoards = encounteredBoards.add(board);

  // Record the state as a solution
  if (board.count() === 1) {
    solutions = solutions.push(state.jumps);
  }

  // Create a new board for each available jump
  jumps.forEach(jump => {
    if (board.has(jump.start) && board.has(jump.middle) && !board.has(jump.end)) {
      states = states.push(new State({
        board: board.remove(jump.start).remove(jump.middle).add(jump.end),
        jumps: state.jumps.push(jump),
      }));
    }
  });
}

function formatSolution(jumps) {
  return jumps.map(jump => `${jump.start} --> ${jump.end}`).join('\n');
}

console.log(solutions.map(formatSolution).join('\n----------\n'));
