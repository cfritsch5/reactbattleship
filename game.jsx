import React from 'react';
import {startGame} from './battleship';
import Board from './board';

class Game extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      ai: false,
      game: startGame(6,3),
    };

    this.attack = this.attack.bind(this);
    this.updateGrids = this.updateGrids.bind(this);
    this.respond = this.respond.bind(this);
    this.playDemo = this.playDemo.bind(this);
    this.playComputer = this.playComputer.bind(this);
  }

  componentWillMount(){
    this.updateGrids();
  }

  updateGrids(){
    this.setState({
      grid1: this.state.game.player1.grid,
      grid2: this.state.game.player2.grid,
    });
  }

  playDemo(result){
    if(result !== 'Lost' ){
      setTimeout(()=>{
          result = this.state.game.playDemo();
          this.respond(result);
          this.playDemo(result);
      },500);
    }
  }

  playComputer(){
    if(!this.state.over){
      if(this.state.game.currentPlayer === this.state.game.player2){
        let result = this.state.game.playDemo();
        this.respond(result);
      }
    }
    // console.log('comp',this.state.game.currentPlayer );
    // console.log(this.state.game.currentPlayer === this.state.game.player2);
  }

  attack(row,col){
    let result = this.state.game.play(row,col);
    this.respond(result);
    if(this.state.ai){
      setTimeout(()=>this.playComputer(),500);
    }
  }

  respond(result){
    this.setState({result:this.state.game.currentPlayer.result});

    if(result === 'Lost'){
      this.setState({
        over: 'over',
        result: `Game Over`
      });
    } else {
      setTimeout(()=>this.setState({result:''}),250);
    }

    this.updateGrids();
  }

  placePlayer(player){
    let active = this.state.game.currentPlayer !== player ? 'active' : 'inactive';
    return(
      <div className={`player ${active}`}>
        <h4>{`${player.name}'s board`}</h4>
          <Board attack={this.attack} board={player.grid}/>
      </div>
    );
  }

  render(){
    let game = this.state.game;
    let over = this.state.over;

    return(
      <div>
        <div className={`game ${over}`}>
          <h4 className='result'>{this.state.result}</h4>
          {this.placePlayer(game.player1)}
          {this.placePlayer(game.player2)}
        </div>
        <label>
          Play Computer
          <input type='checkbox' onClick={()=>this.setState({ai: !this.state.ai})}/>
        </label>
        <button onClick={this.playDemo}>Demo Game</button>
      </div>
    );
  }
}
export default Game;
