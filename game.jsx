import React from 'react';
import {createBoard, attack} from './battleship';
import Board from './board';

class Game extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      player1: createBoard('player1'),
      player2: createBoard('player2'),
      toggle: true,
      result: '',
      gameOver: false,
    };

    this.attackHere = this.attackHere.bind(this);
    this.togglePlayers = this.togglePlayers.bind(this);
    this.playDemoGame = this.playDemoGame.bind(this);
    this.currentPlayer = this.currentPlayer.bind(this);
    this.targetShip = this.targetShip.bind(this);
  }

  togglePlayers(){
    setTimeout(()=>{
      this.setState({result: ''});
      this.setState({toggle: !this.state.toggle});
    }, 500);
  }

  currentPlayer(){
    return this.state.toggle ? this.state.player2 : this.state.player1;
  }

  attackHere(row, col){
    console.log('atack player',this.currentPlayer());
    let updatedBoard = attack(this.currentPlayer(),row, col);
    this.setState({result: updatedBoard.result});

    if(updatedBoard.result === 'Lost'){
      this.setState({gameOver: true});
    } else {
      this.setState({[this.currentPlayer().name]: updatedBoard});
      this.togglePlayers();
    }
    return updatedBoard.result;
  }

  newGame(){
    this.setState({
      player1: createBoard('bob'),
      player2: createBoard('notbob'),
      toggle: true,
      result: '',
      gameOver: false,
    });
  }


  playDemoGameR(){
    let row,col;

      row = Math.floor(Math.random()*6);
      col = Math.floor(Math.random()*6);
      this.attackHere(row,col);

    if(!this.state.gameOver){
      setTimeout(()=>this.playDemoGameS(), 250);
    }
  }

  /*
  player1
  - ships {1:length 2, active false, positions, tried}

  if hit randomly activate ship
  queue positions to try around hit
  when hit again keep going in that direction until sunk or miss
  - if not sunk go in other
________
    if hit positions
    keep array of hit positions
    if last was a hit check
  */


  playDemoGame(){
    let row,col,value,flag = true;
    let i = 0;
    while(flag && i < 100){
      i++;
      // console.log('while');
      row = Math.floor(Math.random()*6);
      col = Math.floor(Math.random()*5);
      col = row%2 ? col - col%2 :col - col%2 + 1;
      value = this.currentPlayer().grid[row][col];
      // console.log(row,col,value,this.currentPlayer().grid);
      if(value !== 2 && value !== 3) flag = false;
    }
    // console.log(this.attackHere(row,col));
    // console.log(value,this.currentPlayer().grid[row][col]);
      if(this.attackHere(row,col)==='Hit'){
        this.targetShip(row,col);
      } else {
        if(!this.state.gameOver){
          setTimeout(()=>this.playDemoGame(), 250);
        }
      }
  }


  targetShip(row,col){
    console.log('Targert');
    let rowDelta, colDelta, direction, value;
    let grid = this.currentPlayer().grid;
    let directions = [[0,-1],[0,1],[-1,0],[1,0]];
    let i = 0;
    let loopdy = ()=>{
      setTimeout(()=>{
        console.log('loopsdt');
        rowDelta = row+directions[i][0];
        colDelta = col+directions[i][1];
        value = grid[rowDelta][colDelta];

        if(grid[row][col] && value !== 2 && value !== 3 ){

          console.log(this.currentPlayer().grid[row][col],row,col);
          if(this.attackHere(rowDelta, colDelta) === 'Hit'){
            direction = directions[i];
            let sunkloop = ()=> setTimeout(()=>{
              console.log('sunkl');
              if(attack(rowDelta, colDelta) !== 'Sunk'){
                setTimeout(sunkloop,250);
              }
            },250);
            sunkloop();
          }
        }
        i++;
        if( i < directions.length){
          loopdy();
        }
      },250);
    };
    loopdy();
    // for(let i = 0; i < directions.length; i++){

  }

  // var i = 0;
  // var a = ()=>{
  //   setTimeout(()=>{
  //     console.log(i);
  //     i++;
  //     if(i<3){
  //       a();
  //     }
  //   },100);
  // };

  playerClasses(toggle){
    let active = toggle ? 'active' : 'inactive';
    let result = toggle ? this.state.result : '';
    if(this.state.gameOver)result = !toggle? 'Won' : this.currentPlayer().result;
    return {active,result};
  }

  placePlayer(p1,num){
    return(
      <div className={`player ${p1.active}`}>
        <h4>{`Player ${num}'s board`}</h4>
        <div className='board'>
          <h3 className='result'>{p1.result}</h3>
          <Board attack={this.attackHere} board={this.state['player'+num].grid}/>
        </div>
      </div>
    );
  }

  newGameButton(){
    if(this.state.gameOver){
      return (
        <button className='newgame' onClick={()=>this.newGame()}>
          New Game?
        </button>
      );
    }
  }

  render(){
    // console.log(this.state.player1.result);
    let toggle = this.state.toggle;
    let p1 = this.playerClasses(!toggle);
    let p2 = this.playerClasses(toggle);
    let over = this.state.gameOver ? 'over' : '';

    return(
      <div>
        <button onClick={()=>this.playDemoGame()}>Demo Game</button>
        {this.newGameButton()}
        <h2>Player {(toggle ? '1' : '2') + '\'s'} turn</h2>
        <div className={`game ${over}`}>
          {this.placePlayer(p1,'1')}
          {this.placePlayer(p2,'2')}
        </div>
      </div>
    );
  }
}
export default Game;
