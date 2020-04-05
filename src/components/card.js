import React from 'react';

export default props => (
  <div
    className="card-front"
    style={{
      backgroundColor: props.state[props.index]?
        props.state[props.index].treasure?
        '#dd0' :
        props.state[props.index].victory?
        '#0a0' : '#ccc' : '#fff',
      cursor: props.state[props.index]? 'pointer' : 'default'
    }}
    onClick={props.onClick}
  >
    {props.state[props.index]? props.state[props.index].name : ''}&nbsp;
  </div>
);
