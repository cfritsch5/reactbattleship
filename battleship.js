//Generate set up

export const startGame = function game(size = 2, numShips = 1){
  const player1 = createPlayer('player1',size,numShips);
  const player2 = createPlayer('player2',size,numShips);
  let toggle = true;
  let switchPlayers = ()=>{
    toggle = !toggle;
    _game.currentPlayer = toggle ? player1 : player2;
  };
  let _game = {
    player1, player2,
    currentPlayer: player1,
    turn:()=>{
      switchPlayers();
      if(_game.currentPlayer.mode.hunt){
        return hunt(_game.currentPlayer);
      } else {
        return target(_game.currentPlayer);
      }
    },
    play:(row,col)=>{
      switchPlayers();
      let result = attack(_game.currentPlayer,row,col);
      return result;
    }
  };

  return _game;
};

export const createPlayer = function boardSetUp(name,size,numShips){
  let player = {name, result: null, sunk: 0};
  let blankgrid = generateGrid(size);
  player.ships = generateShips(numShips);
  player.grid = placeShips(blankgrid, player.ships);
  player.opponentGrid = generateGrid(size);
  player.opponentShips = generateShips(numShips);
  player.mode = {hunt:true, target: {queue: [[1,0],[0,1],[-1,0],[0,-1]], hits: []}};
  return player;
};

export const generateGrid = function generateGrid(size = 6){
  let row,  grid = [];
  for(let i = 0 ; i < size ; i++){
    row = [];
      for(let j = 0; j < size ; j++){
        row.push(0);
      }
    grid.push(row);
  }
  return grid;
};

function generateShips(numShips = 3){
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

const RESULTS = {miss:'Miss',hit:'Hit',repeat:'Already Taken',sunk:'Sunk',lost:'Lost'};
export const attack = function torpedosAway(player, row, col){
  let result, grid = player.grid, square = grid[row][col];

  switch (square) {
    case 0: //miss
      grid[row][col] = 2;
      result = RESULTS.miss;
      break;
    case 2: //already hit and was a miss
    case 3: //already taken and was a hit
      result = RESULTS.repeat;
      break;
    default: //hit
    if(square.length){
      grid[row][col] = 3;
      result = RESULTS.hit;
      if(sunk(grid,square)) {
        result = RESULTS.sunk;
        player.sunk++;
        if(player.sunk >= player.ships.length) result = RESULTS.lost;
      }
    } else {
      throw 'out of bounds';
    }
      break;
  }
  player.result = result;
  return result;
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
  ship.sunk = true;
  return true;
}


function hunt(player){
  console.log('hunt__________________');
  let row,col, size = player.grid.length;
  let parityOffset, i = 0;
  do {
    row = Math.floor(Math.random()*size);
    col = Math.floor(Math.random()*(size));
    col = col - col%2;

    if(i < size*size/2 ){
      col = row%2 ? col: col + 1;
    } else {
      col = !(row%2) ? col: col + 1;
    }

    i++;
    // console.log('hunt do while', row, col,i);
  } while(player.opponentGrid[row][col] !== 0);

  let result = attack(player,row,col);
  // console.log('hunt attack',row,col,result);

  if(result === RESULTS.hit){
    player.mode.hunt = false;
    player.mode.target.queue = [[1,0],[0,1],[-1,0],[0,-1]];
    player.mode.target.hits = [[row,col]];
    player.opponentGrid[row][col] = 1;
  } else {
    player.opponentGrid[row][col] = 2;
  }

  return result;
}

function syncprint(...args){
  for(let i = 0; i < args.length; i++){
    console.log(JSON.stringify(args[i]));
  }
}

function target(player){
  console.log('target');
  let targetGrid = player.opponentGrid;
  let size = player.grid.length;
  let tg = player.mode.target;
  let row, col, delta;
  let retry = true;

  while(retry) {
    syncprint('while',tg);
    if(tg.queue.length <= 0){
      player.mode.hunt = true;
      hunt(player);
      break;
    }

    delta = tg.queue.shift();
    row = tg.hits[0][0]+delta[0];
    col = tg.hits[0][1]+delta[1];
    console.log('prevalid',validsquare());
    if(validsquare(row,col,size)){
      console.log('valid');
      retry = false;
      return handleTargetResult(player,row,col,delta,attack(player,row,col));
    }
  } //end while
}

function validsquare(row,col,size){
  let lowerbound = row > 0 && col > 0;
  let upperbound = row < size && col < size;
  return upperbound && lowerbound;
}

function handleTargetResult(player,row,col,delta,result){
  let tg = player.mode.target;
  let targetGrid = player.opponentGrid;

  switch (result) {
    case 'Hit':
    tg.hits.unshift([row,col]);
    tg.queue = [delta];
    break;
    case 'Miss':
    case 'Already Taken':
    targetGrid[row][col] = 2;
    if(tg.queue.length <= 0){
      player.mode.hunt = true;
    }
    break;
    case 'Sunk':
    player.mode.hunt = true;
    break;
    default:
  }
  return result;
}
