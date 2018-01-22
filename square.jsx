import React from 'react';

class Square extends React.Component {
  render(){
    return(
      <li
        className={this.props.class}
        onClick={()=>this.props.attack(this.props.row, this.props.col)}>
      </li>
    );
  }
}

export default Square;
