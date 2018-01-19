import React from 'react';

class Square extends React.Component {
  render(){
    return(
      <li
        className={this.props.class}
        onClick={()=>this.props.attack(this.props.x, this.props.y)}>
      </li>
    );
  }
}

export default Square;
