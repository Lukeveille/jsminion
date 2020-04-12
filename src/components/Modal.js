import React from 'react';
import { useEffect } from 'react';

export default props => {
  useEffect(() => {
    console.log(props);
  }, [props.children])
  return <div
    style={{display: props.show? 'flex' : 'none' }}
    className="modal-bg"
    onClick={() => props.setShow(false)}
  >
    <div className="modal-box" onClick={event => event.stopPropagation()}>
      <div className="modal-top-row">
        <div className="x-close-button" onClick={() => props.setShow(false)}>x</div>
      </div>
      <div className="modal-content">{props.children}</div>
    </div>
  </div>
};
