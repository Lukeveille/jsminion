import React from 'react';

export default props => (
  <div
    className="card-front"
    style={{
      backgroundColor: props.state[props.index]? props.state[props.index].cycle === 'buy'? '#dd0' : '#ccc' : '#fff',
      cursor: props.state[props.index]? 'pointer' : 'default'
    }}
    onClick={props.onClick}
  >
    {props.state[props.index]? props.state[props.index].value : ''}&nbsp;
  </div>
);
