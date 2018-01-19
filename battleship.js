//Generate set up
export const createBoard = function boardSetUp(name){
  let board = {name, result: null, sunk: 0};
  let blankgrid = generateGrid();
  board.ships = generateShips();
  board.grid = placeShips(blankgrid, board.ships);
  return board;
};

function generateGrid(size = 2){
  let row,  grid = [];
  for(let i = 0 ; i < size ; i++){
    row = [];
      for(let j = 0; j < size ; j++){
        row.push(0);
      }
    grid.push(row);
  }
  return grid;
}

function generateShips(numShips = 1){
  let ships = [];
  for(let i = 0; i < numShips; i++){
    ships.push({sunk: false, length:(2+i)});
  }
  return ships;
}

function placeShips(grid,ships){
  for(let i = 0 ; i < ships.length; i++){
    let flag = true;
    let row,col;
    while (flag){
      row = Math.floor(Math.random()* grid.length);
      col = Math.floor(Math.random()* grid.length);
      try {
        flag = false;
        grid = placeShip(grid, ships[i], [row,col]);
      } catch(er){
        flag = true;
      }
    }
  }
  return grid;
}

function placeShip(grid,ship,position){
  let orientation = Math.floor(Math.random()*2);
  let row = position[0], col = position[1];
  ship.positions = [];
  for(let i = 0; i < ship.length; i++){
    if(grid[row][col] !== 0) throw 'invalid placement';
    row += orientation ? 1 : 0;
    col += orientation ? 0 : 1;
    //    orientation ? (row+=1) : (col+=1); looks cleaner but lint hates it
  }
  row = position[0];
  col = position[1];
  for(let i = 0; i < ship.length; i++){
    grid[row][col] = ship;
    ship.positions.push({row,col:col});
    orientation ? (row+=1) : (col+=1);
  }
  return grid;
}

//attack a space to play a turn
export const attack = function torpedosAway(board, row, col){
  let result, grid = board.grid, square = grid[row][col];

  switch (square) {
    case 0: //miss
      grid[row][col] = 2;
      board.result = 'Miss';
      break;
    case 2: //already hit and was a miss
    case 3: //already taken and was a hit
      board.result = 'already taken';
      break;
    default: //hit
      grid[row][col] = 3;
      board.result = 'Hit';
      if(sunk(grid,square)) {
        board.result = 'Sunk';
        board.sunk++;
        if(board.sunk >= board.ships.length) board.result = 'Lost';
      }
      break;
  }
  return board;
};

function sunk(grid, ship){
  let i = 0, flag = true;
  while(i < ship.positions.length){
    let row = ship.positions[i].row;
    let col = ship.positions[i].col;
    if(grid[row][col] instanceof Object){
      return false;
    }
    i++;
  }
  // console.log('glurg glug blub *');
  ship.sunk = true;
  return true;
}
