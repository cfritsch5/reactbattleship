import React from 'react';
import {createBoard, attack} from './battleship';
import Board from './board';

class Game extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      player1: createBoard('bob'),
      player2: createBoard('notbob'),
      toggle: true,
      result: '',
      gameOver: false,
    };

    this.attack = this.attack.bind(this);
    this.togglePlayers = this.togglePlayers.bind(this);
    this.playDemoGame = this.playDemoGame.bind(this);
  }

  togglePlayers(){
    setTimeout(()=>{
      this.setState({result: ''});
      this.setState({toggle: !this.state.toggle});
    }, 500);
  }

  attack(x,y){
    let current = this.state.toggle ? 'player2' : 'player1';
    let updatedBoard = attack(this.state[current],y,x);

    this.setState({result: updatedBoard.result});

    if(updatedBoard.result === 'Lost'){
      this.setState({gameOver: true});
    } else {
      this.setState({[current]: updatedBoard});
      this.togglePlayers();
    }
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

  playDemoGame(played){
    played = played || Array(10).fill(null,0).map(()=>Array(10).fill(null,0));
    let row,col;

    do {
      row = Math.floor(Math.random()*10);
      col = Math.floor(Math.random()*10);
    } while(played[row][col] !== null);

    played[row][col] = 'x';
    this.attack(row,col);

    if(!this.state.gameOver){
      setTimeout(()=>this.playDemoGame(played), 500);
    }
  }

  playerClasses(toggle){
    let active = toggle ? 'active' : 'inactive';
    let result = toggle ? this.state.result : '';
    if(this.state.gameOver)result = toggle? 'Won' : result;
    return {active,result};
  }

  placePlayer(p1,num){
    return(
      <div className={`player ${p1.active}`}>
        <h4>{`Player ${num}'s board`}</h4>
        <div className='board'>
          <h3 className='result'>{p1.result}</h3>
          <Board attack={this.attack} board={this.state['player'+num].grid}/>
        </div>
      </div>
    );
  }

  render(){
    let toggle = this.state.toggle;
    let p1 = this.playerClasses(!toggle);
    let p2 = this.playerClasses(toggle);
    let over = this.state.gameOver ? 'over' : '';
    let newGame;

    if(this.state.gameOver){
      newGame = ( <button className='newgame' onClick={()=>this.newGame()}>
          New Game?
        </button>);
    }

    return(
      <div>
        <button onClick={()=>this.playDemoGame()}>Demo Game</button>
        {newGame}
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
