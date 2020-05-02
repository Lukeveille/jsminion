import React from 'react';

export default props => (  
  <div className="info">
    <span className="hidden">VP <span className='red'>{props.victoryPoints}</span> |&nbsp;</span>
    <span>Action <span className='red'>{props.actions}</span> |&nbsp;</span>
    <span>Buys <span className='red'>{props.buys}</span> |&nbsp;</span>
    <span>Coin <span className='coin'>{props.treasure - props.bought + props.coinMod}</span> </span>
  </div>
);
