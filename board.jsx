import React from 'react';
import Square from './square';
class Board extends React.Component {

  generateBoard(){
    let indexY = 0;
    return this.props.board.map((row)=>{
      let squares = this.generateSquares(row, indexY);
      indexY++;
      return <ul key={indexY}>{squares}</ul>;
    });
  }

  generateSquares(row, indexY){
    let cssClassName, indexX = -1; // shortcut way around off by one
    return row.map((square)=>{
      indexX++;
      switch (square) {
        case 2:
          cssClassName = 'missed';
          break;
        case 3:
          cssClassName = 'hit';
          break;
        default:
          cssClassName = 'open';
      }
      return (
        <Square key={indexX}
          class={cssClassName}
          col={indexX} row={indexY}
          attack={this.props.attack} />
      );
    });
  }

  render(){
    // console.log(this.props.attack);
    return(
      <div className='board'>
        {this.generateBoard()}
      </div>
    );
  }
}
export default Board;
