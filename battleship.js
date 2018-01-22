//Generate set up
export const startGame = function startGame(size = 2, numShips = 1){
  const player1 = createPlayer('player1',size,numShips);
  const player2 = createPlayer('player2',size,numShips);

  //game Object closes over toggle & switch
  let toggle = true;
  let switchPlayers = ()=>{
    toggle = !toggle;
    game.currentPlayer = toggle ? player1 : player2;
  };

  //game object
  let game = {
    player1,
    player2,
    currentPlayer: player1,
    playDemo:()=>{
      switchPlayers();
      if(game.currentPlayer.mode.hunt){
        return hunt(game.currentPlayer);
      } else {
        return target(game.currentPlayer);
      }
    },
    play:(row,col)=>{
      switchPlayers();
      let result = attack(game.currentPlayer,row,col);
      return result;
    }
  };

  return game;
};

export const createPlayer = function boardSetUp(name,size,numShips){
  let player = {
    name,
    result: null,
    sunk: 0,
    mode: {
      hunt:true,
      target: {
        queue: [[1,0],[0,1],[-1,0],[0,-1]],
        hits: []
      }
    },
    opponentGrid: generateGrid(size),
    opponentShips: generateShips(numShips),
  };

  player.ships = generateShips(numShips);
  player.grid = placeShips(generateGrid(size), player.ships);

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
    let row, col, flag = true;
    //randomly select ship positions & try ship placement
    while (flag){
      row = Math.floor(Math.random()* grid.length);
      col = Math.floor(Math.random()* grid.length);
      try {
        flag = false;
        grid = placeShip(grid, ships[i], [row,col]);
      } catch(er){
        flag = true;
      }
    } //end while
  } // end for
  return grid;
}

function placeShip(grid,ship,position){
  let orientation = Math.floor(Math.random()*2);
  let row = position[0], col = position[1];
  ship.positions = [];

  //validate ship placement
  for(let i = 0; i < ship.length; i++){
    if(grid[row][col] !== 0) throw 'invalid placement';
    row += orientation ? 1 : 0;
    col += orientation ? 0 : 1;
  }
  //reset starting positions
  row = position[0];
  col = position[1];

  //places ships on grid if placement was valid
  for(let i = 0; i < ship.length; i++){
    grid[row][col] = ship;
    ship.positions.push({row,col:col});
    row += orientation ? 1 : 0;
    col += orientation ? 0 : 1;
  }
  return grid;
}

//handle game play
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

//hunt randomly selects positions to hits
//if it hits then enter target mode
function hunt(player){
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
  } while(player.opponentGrid[row][col] !== 0);

  let result = attack(player,row,col);

  if(result === RESULTS.hit){
    player.mode.hunt = false;
    //reset queue and hits for target mode
    player.mode.target.queue = [[1,0],[0,1],[-1,0],[0,-1]];
    player.mode.target.hits = [[row,col]];

    player.opponentGrid[row][col] = 1;
  } else {
    player.opponentGrid[row][col] = 2;
  }

  return result;
} //end hunt

function syncprint(...args){
  for(let i = 0; i < args.length; i++){
    console.log(JSON.stringify(args[i]));
  }
}

function target(player){
  let targetGrid = player.opponentGrid;
  let size = player.grid.length;
  let tg = player.mode.target;
  let row, col, delta;
  let retry = true;

  while(retry) {
    if(tg.queue.length <= 0){
      player.mode.hunt = true;
      hunt(player);
      break;
    }

    delta = tg.queue.shift();
    row = tg.hits[0][0]+delta[0];
    col = tg.hits[0][1]+delta[1];
    if(validsquare(row,col,size)){
      retry = false;
      return handleTargetResult(player,row,col,delta,attack(player,row,col));
    }
  } //end while
} //end target

function validsquare(row,col,size){
  let lowerbound = row > 0 && col > 0;
  let upperbound = row < size && col < size;
  return upperbound && lowerbound;
}

function handleTargetResult(player,row,col,delta,result){
  let tg = player.mode.target;
  let targetGrid = player.opponentGrid;

  switch (result) {
    case RESULTS.hit:
      tg.hits.unshift([row,col]);
      tg.queue = [delta];
    break;
    case RESULTS.miss:
    case RESULTS.repeat:
      targetGrid[row][col] = 2;
      if(tg.queue.length <= 0){
        player.mode.hunt = true;
      }
      break;
    case RESULTS.sunk:
      player.mode.hunt = true;
      break;
    default:
  }
  return result;
}
