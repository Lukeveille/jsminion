import React from 'react';

export default props => {
  return <div
    style={{display: props.show? 'flex' : 'none' }}
    className="modal-bg"
    onClick={() => props.setShow(false)}
  >
    <div className="modal-box" onClick={event => event.stopPropagation()}>
      <div className="modal-top-row">
        {props.close? <div className="x-close-button" onClick={() => props.setShow(false)}>x</div> : ''}
      </div>
      <div className="modal-content">{props.children}</div>
    </div>
  </div>
};
